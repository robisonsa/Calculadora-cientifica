'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Calculator, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react'
import type { Questao, Habilidade, Gabarito, Disciplina } from '@/lib/types/database'

type Step = 'choose' | 'quiz' | 'done'

interface QuestaoComHabilidade extends Questao {
  habilidade: Habilidade
}

export default function DiagnosticoPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('choose')
  const [disciplina, setDisciplina] = useState<Disciplina | null>(null)
  const [questoes, setQuestoes] = useState<QuestaoComHabilidade[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, Gabarito>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<Gabarito | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [loading, setLoading] = useState(false)
  const [diagnosticoId, setDiagnosticoId] = useState<string | null>(null)
  const [jaFeito, setJaFeito] = useState<Disciplina[]>([])

  useEffect(() => {
    async function checkDiagnosticos() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('diagnosticos')
        .select('disciplina')
        .eq('estudante_id', user.id)
        .eq('concluido', true)

      if (data) setJaFeito(data.map((d) => d.disciplina as Disciplina))
    }
    checkDiagnosticos()
  }, [])

  async function startDiagnostico(disc: Disciplina) {
    setLoading(true)
    setDisciplina(disc)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('turma_id, ano_escolar')
      .eq('id', user.id)
      .single()

    if (!profile?.ano_escolar) {
      alert('Seu ano escolar não está definido. Contate o professor.')
      setLoading(false)
      return
    }

    // Buscar habilidades por disciplina e ano escolar
    const { data: habilidades } = await supabase
      .from('habilidades')
      .select('*')
      .eq('disciplina', disc)
      .eq('ano_escolar', profile.ano_escolar)

    if (!habilidades || habilidades.length === 0) {
      alert(`Nenhuma habilidade cadastrada para ${profile.ano_escolar}. Execute o seed no Supabase.`)
      setLoading(false)
      return
    }

    // Agrupar por eixo e pegar até 5 questões por eixo (total ~20)
    const eixos = [...new Set(habilidades.map((h) => h.eixo))]
    const questoesSelecionadas: QuestaoComHabilidade[] = []

    for (const eixo of eixos) {
      const habilidadesDoEixo = habilidades.filter((h) => h.eixo === eixo)
      for (const hab of habilidadesDoEixo) {
        const { data: questoesHab } = await supabase
          .from('questoes')
          .select('*')
          .eq('habilidade_id', hab.id)
          .limit(2)

        if (questoesHab) {
          questoesSelecionadas.push(...questoesHab.map((q) => ({ ...q, habilidade: hab })))
        }
      }
      if (questoesSelecionadas.length >= 20) break
    }

    const questoesFinal = questoesSelecionadas.slice(0, 20)

    // Criar diagnóstico
    const { data: diag } = await supabase
      .from('diagnosticos')
      .insert({
        estudante_id: user.id,
        turma_id: profile?.turma_id ?? null,
        disciplina: disc,
        concluido: false,
      })
      .select()
      .single()

    if (!diag) {
      setLoading(false)
      return
    }

    setDiagnosticoId(diag.id)
    setQuestoes(questoesFinal)
    setCurrentIndex(0)
    setRespostas({})
    setSelectedAnswer(null)
    setShowFeedback(false)
    setStep('quiz')
    setLoading(false)
  }

  function handleSelectAnswer(alt: Gabarito) {
    if (showFeedback) return
    setSelectedAnswer(alt)
  }

  function handleConfirmAnswer() {
    if (!selectedAnswer) return
    const questao = questoes[currentIndex]
    setRespostas((prev) => ({ ...prev, [questao.id]: selectedAnswer }))
    setShowFeedback(true)
  }

  async function handleNext() {
    if (currentIndex < questoes.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      await finalizarDiagnostico()
    }
  }

  async function finalizarDiagnostico() {
    if (!diagnosticoId) return
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Salvar respostas
    const respostasArray = questoes.map((q) => ({
      diagnostico_id: diagnosticoId,
      questao_id: q.id,
      habilidade_id: q.habilidade_id,
      resposta_estudante: respostas[q.id] ?? 'a',
      correta: respostas[q.id] === q.gabarito,
    }))

    await supabase.from('respostas_diagnostico').insert(respostasArray)

    // Calcular nível identificado
    const acertosTotal = respostasArray.filter((r) => r.correta).length
    const percentual = acertosTotal / questoes.length
    let nivel = 2
    if (percentual >= 0.8) nivel = 7
    else if (percentual >= 0.6) nivel = 5
    else if (percentual >= 0.4) nivel = 4
    else if (percentual >= 0.2) nivel = 3

    // Atualizar diagnóstico
    await supabase
      .from('diagnosticos')
      .update({ concluido: true, nivel_identificado: nivel })
      .eq('id', diagnosticoId)

    // Gerar trilha personalizada
    await gerarTrilha(user.id, disciplina!, nivel, respostasArray, supabase)

    setStep('done')
    setLoading(false)
  }

  async function gerarTrilha(
    estudanteId: string,
    disc: Disciplina,
    nivel: number,
    respostasArray: { habilidade_id: string; correta: boolean }[],
    supabase: ReturnType<typeof createClient>
  ) {
    // Identificar habilidades com < 40% de acerto
    const acertosPorHabilidade: Record<string, { acertos: number; total: number }> = {}
    for (const r of respostasArray) {
      if (!acertosPorHabilidade[r.habilidade_id]) {
        acertosPorHabilidade[r.habilidade_id] = { acertos: 0, total: 0 }
      }
      acertosPorHabilidade[r.habilidade_id].total++
      if (r.correta) acertosPorHabilidade[r.habilidade_id].acertos++
    }

    const { data: habilidades } = await supabase
      .from('habilidades')
      .select('*')
      .eq('disciplina', disc)
      .order('nivel_escala_saeb', { ascending: true })

    if (!habilidades) return

    const habilidadesLacuna = habilidades.filter((h) => {
      const stats = acertosPorHabilidade[h.id]
      if (!stats) return true
      return stats.acertos / stats.total < 0.4
    })

    function xpPorNivel(n: number) {
      if (n <= 3) return 100
      if (n <= 6) return 150
      return 200
    }

    const xpTotal = habilidadesLacuna.reduce((sum, h) => sum + xpPorNivel(h.nivel_escala_saeb), 0)

    const { data: trilha } = await supabase
      .from('trilhas')
      .insert({
        estudante_id: estudanteId,
        disciplina: disc,
        xp_total_possivel: xpTotal,
        xp_acumulado: 0,
      })
      .select()
      .single()

    if (!trilha) return

    const trilhaHabilidades = habilidadesLacuna.map((h) => ({
      trilha_id: trilha.id,
      habilidade_id: h.id,
      status: 'nao_iniciada',
    }))

    if (trilhaHabilidades.length > 0) {
      await supabase.from('trilha_habilidades').insert(trilhaHabilidades)
    }
  }

  // Render: escolha de disciplina
  if (step === 'choose') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Diagnóstico Inicial</h1>
          <p className="text-gray-500 mt-2">
            Escolha a disciplina para começar. O diagnóstico tem 20 questões e leva cerca de 20 minutos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {(['lp', 'matematica'] as Disciplina[]).map((disc) => {
            const feito = jaFeito.includes(disc)
            return (
              <button
                key={disc}
                onClick={() => !feito && startDiagnostico(disc)}
                disabled={feito || loading}
                className={`relative border-2 rounded-2xl p-8 text-center transition-all ${
                  feito
                    ? 'border-green-300 bg-green-50 cursor-default'
                    : 'border-gray-200 bg-white hover:border-primary hover:shadow-md cursor-pointer'
                }`}
              >
                {feito && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                )}
                <div className="text-4xl mb-3">{disc === 'lp' ? '📖' : '🔢'}</div>
                <h3 className="text-lg font-bold text-foreground">
                  {disc === 'lp' ? 'Língua Portuguesa' : 'Matemática'}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {feito ? 'Diagnóstico já realizado' : '20 questões · ~20 minutos'}
                </p>
                {!feito && (
                  <div className="mt-4 inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold">
                    {loading ? 'Carregando...' : 'Iniciar'}
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {jaFeito.length === 2 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="font-semibold text-foreground">Todos os diagnósticos concluídos!</p>
            <button
              onClick={() => router.push('/estudante/dashboard')}
              className="mt-3 text-primary font-semibold hover:underline text-sm"
            >
              Ir para o Dashboard →
            </button>
          </div>
        )}
      </div>
    )
  }

  // Render: quiz
  if (step === 'quiz') {
    const questao = questoes[currentIndex]
    const isCorrect = selectedAnswer === questao?.gabarito
    const alternativas: { key: Gabarito; texto: string }[] = [
      { key: 'a', texto: questao?.alternativa_a ?? '' },
      { key: 'b', texto: questao?.alternativa_b ?? '' },
      { key: 'c', texto: questao?.alternativa_c ?? '' },
      { key: 'd', texto: questao?.alternativa_d ?? '' },
    ]

    return (
      <div className="max-w-2xl mx-auto">
        {/* Progresso */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-500">
              Questão {currentIndex + 1} de {questoes.length}
            </span>
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
              {disciplina === 'lp' ? 'Língua Portuguesa' : 'Matemática'} · {questao?.habilidade?.codigo}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questoes.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Questão */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {questao?.habilidade?.descricao}
          </p>
          <p className="text-foreground font-medium leading-relaxed text-base">
            {questao?.enunciado}
          </p>
        </div>

        {/* Alternativas */}
        <div className="space-y-3 mb-6">
          {alternativas.map((alt) => {
            let classes = 'w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-sm transition-all '
            if (!showFeedback) {
              classes += selectedAnswer === alt.key
                ? 'border-primary bg-blue-50 text-primary'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-foreground'
            } else {
              if (alt.key === questao.gabarito) {
                classes += 'border-success bg-green-50 text-green-700'
              } else if (alt.key === selectedAnswer && selectedAnswer !== questao.gabarito) {
                classes += 'border-red-400 bg-red-50 text-red-600'
              } else {
                classes += 'border-gray-200 bg-white text-gray-400'
              }
            }

            return (
              <button key={alt.key} onClick={() => handleSelectAnswer(alt.key)} className={classes}>
                <span className="font-bold uppercase mr-3">{alt.key})</span>
                {alt.texto}
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`p-4 rounded-xl mb-4 flex items-center gap-3 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {isCorrect
              ? <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
            <p className={`text-sm font-semibold ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
              {isCorrect ? 'Correto! Muito bem!' : `Resposta correta: ${questao.gabarito.toUpperCase()}`}
            </p>
          </div>
        )}

        {/* Botões */}
        {!showFeedback ? (
          <button
            onClick={handleConfirmAnswer}
            disabled={!selectedAnswer}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar resposta
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Calculando...
              </>
            ) : currentIndex < questoes.length - 1 ? (
              <>
                Próxima questão
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              'Finalizar diagnóstico'
            )}
          </button>
        )}
      </div>
    )
  }

  // Render: concluído
  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Diagnóstico concluído!</h2>
        <p className="text-gray-500 mb-6">
          Sua trilha personalizada de {disciplina === 'lp' ? 'Língua Portuguesa' : 'Matemática'} foi gerada automaticamente com base no seu resultado.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => setStep('choose')}
            className="w-full bg-gray-100 text-foreground py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Fazer outro diagnóstico
          </button>
          <button
            onClick={() => router.push('/estudante/dashboard')}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-800 transition-colors"
          >
            Ver minha trilha
          </button>
        </div>
      </div>
    </div>
  )
}
