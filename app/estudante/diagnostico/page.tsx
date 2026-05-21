'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, CheckCircle, AlertCircle, BookOpen, Calculator, Zap, Target } from 'lucide-react'
import type { Questao, Habilidade, Gabarito, Disciplina } from '@/lib/types/database'

type Step = 'choose' | 'quiz' | 'done'

interface QuestaoComHabilidade extends Questao {
  habilidade: Habilidade
}

interface ResultadoDiag {
  acertos: number
  total: number
  nivel: number
  habilidadesLacuna: { codigo: string; descricao: string }[]
  disciplina: Disciplina
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
  const [resultado, setResultado] = useState<ResultadoDiag | null>(null)

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

    if (!diag) { setLoading(false); return }

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
    if (!diagnosticoId || !disciplina) return
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const respostasArray = questoes.map((q) => ({
      diagnostico_id: diagnosticoId,
      questao_id: q.id,
      habilidade_id: q.habilidade_id,
      resposta_estudante: respostas[q.id] ?? 'a',
      correta: respostas[q.id] === q.gabarito,
    }))

    await supabase.from('respostas_diagnostico').insert(respostasArray)

    const acertosTotal = respostasArray.filter((r) => r.correta).length
    const percentual = acertosTotal / questoes.length

    // Nível SAEB identificado (1–9) baseado no percentual de acertos
    let nivel = 2
    if (percentual >= 0.8) nivel = 7
    else if (percentual >= 0.6) nivel = 5
    else if (percentual >= 0.4) nivel = 4
    else if (percentual >= 0.2) nivel = 3

    await supabase
      .from('diagnosticos')
      .update({ concluido: true, nivel_identificado: nivel })
      .eq('id', diagnosticoId)

    // Identificar habilidades com lacuna (< 40% de acerto na habilidade)
    const acertosPorHab: Record<string, { acertos: number; total: number }> = {}
    for (const r of respostasArray) {
      if (!acertosPorHab[r.habilidade_id]) acertosPorHab[r.habilidade_id] = { acertos: 0, total: 0 }
      acertosPorHab[r.habilidade_id].total++
      if (r.correta) acertosPorHab[r.habilidade_id].acertos++
    }

    const { data: todasHabilidades } = await supabase
      .from('habilidades')
      .select('*')
      .eq('disciplina', disciplina)
      .order('nivel_escala_saeb', { ascending: true })

    const habilidadesLacuna = (todasHabilidades ?? []).filter((h) => {
      const stats = acertosPorHab[h.id]
      if (!stats) return true
      return stats.acertos / stats.total < 0.4
    })

    // Gerar trilha
    await gerarTrilha(user.id, disciplina, nivel, respostasArray, habilidadesLacuna, supabase)

    setResultado({
      acertos: acertosTotal,
      total: questoes.length,
      nivel,
      habilidadesLacuna: habilidadesLacuna.map((h) => ({ codigo: h.codigo, descricao: h.descricao })),
      disciplina,
    })

    setStep('done')
    setLoading(false)
  }

  async function gerarTrilha(
    estudanteId: string,
    disc: Disciplina,
    _nivel: number,
    _respostasArray: { habilidade_id: string; correta: boolean }[],
    habilidadesLacuna: { id: string; nivel_escala_saeb: number }[],
    supabase: ReturnType<typeof createClient>
  ) {
    function xpPorNivel(n: number) {
      if (n <= 3) return 100
      if (n <= 6) return 150
      return 200
    }

    const xpTotal = habilidadesLacuna.reduce((sum, h) => sum + xpPorNivel(h.nivel_escala_saeb), 0)

    const { data: trilha } = await supabase
      .from('trilhas')
      .insert({ estudante_id: estudanteId, disciplina: disc, xp_total_possivel: xpTotal, xp_acumulado: 0 })
      .select()
      .single()

    if (!trilha) return

    if (habilidadesLacuna.length > 0) {
      await supabase.from('trilha_habilidades').insert(
        habilidadesLacuna.map((h) => ({ trilha_id: trilha.id, habilidade_id: h.id, status: 'nao_iniciada' }))
      )
    }
  }

  // ── Escolha de disciplina ──────────────────────────────────────────────────
  if (step === 'choose') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Diagnóstico Inicial</h1>
          <p className="text-gray-500 mt-2">
            Escolha a disciplina. O diagnóstico tem até 20 questões e leva cerca de 20 minutos.
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
                {feito && <div className="absolute top-3 right-3"><CheckCircle className="w-5 h-5 text-success" /></div>}
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

  // ── Quiz ──────────────────────────────────────────────────────────────────
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

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {questao?.habilidade?.descricao}
          </p>
          <p className="text-foreground font-medium leading-relaxed text-base">{questao?.enunciado}</p>
        </div>

        <div className="space-y-3 mb-6">
          {alternativas.map((alt) => {
            let classes = 'w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-sm transition-all '
            if (!showFeedback) {
              classes += selectedAnswer === alt.key
                ? 'border-primary bg-blue-50 text-primary'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-foreground'
            } else {
              if (alt.key === questao.gabarito) classes += 'border-success bg-green-50 text-green-700'
              else if (alt.key === selectedAnswer && selectedAnswer !== questao.gabarito) classes += 'border-red-400 bg-red-50 text-red-600'
              else classes += 'border-gray-200 bg-white text-gray-400'
            }
            return (
              <button key={alt.key} onClick={() => handleSelectAnswer(alt.key)} className={classes}>
                <span className="font-bold uppercase mr-3">{alt.key})</span>
                {alt.texto}
              </button>
            )
          })}
        </div>

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
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Calculando...</>
            ) : currentIndex < questoes.length - 1 ? (
              <>Próxima questão <ChevronRight className="w-4 h-4" /></>
            ) : (
              'Ver resultado'
            )}
          </button>
        )}
      </div>
    )
  }

  // ── Resultado do diagnóstico ───────────────────────────────────────────────
  if (step === 'done' && resultado) {
    const pct = Math.round((resultado.acertos / resultado.total) * 100)
    const discNome = resultado.disciplina === 'lp' ? 'Língua Portuguesa' : 'Matemática'
    const discIcon = resultado.disciplina === 'lp' ? <BookOpen className="w-5 h-5" /> : <Calculator className="w-5 h-5" />

    const nivelLabel = (n: number) => {
      if (n >= 7) return { label: 'Avançado', cor: 'text-green-600', bg: 'bg-green-100' }
      if (n >= 5) return { label: 'Intermediário', cor: 'text-blue-600', bg: 'bg-blue-100' }
      if (n >= 4) return { label: 'Básico', cor: 'text-yellow-600', bg: 'bg-yellow-100' }
      return { label: 'Abaixo do básico', cor: 'text-red-600', bg: 'bg-red-100' }
    }
    const lvl = nivelLabel(resultado.nivel)

    return (
      <div className="max-w-lg mx-auto space-y-4">
        {/* Cabeçalho */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
          <div className="text-5xl mb-3">{pct >= 60 ? '🎉' : '💪'}</div>
          <h2 className="text-xl font-black text-foreground">Diagnóstico concluído!</h2>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-gray-500 text-sm">
            {discIcon}
            <span>{discNome}</span>
          </div>
        </div>

        {/* Placar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Seu resultado</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-black text-foreground">{resultado.acertos}<span className="text-gray-300 text-xl">/{resultado.total}</span></div>
              <div className="text-xs text-gray-500 mt-1">acertos</div>
            </div>
            <div>
              <div className="text-3xl font-black text-primary">{pct}%</div>
              <div className="text-xs text-gray-500 mt-1">aproveitamento</div>
            </div>
            <div>
              <div className="text-3xl font-black text-secondary">{resultado.nivel}</div>
              <div className="text-xs text-gray-500 mt-1">nível SAEB</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${lvl.bg} ${lvl.cor}`}>
              {lvl.label}
            </span>
          </div>
          {/* Barra de progresso */}
          <div className="mt-4">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Habilidades com lacuna */}
        {resultado.habilidadesLacuna.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Trilha gerada — {resultado.habilidadesLacuna.length} habilidade{resultado.habilidadesLacuna.length > 1 ? 's' : ''} para praticar
              </h3>
            </div>
            <ul className="space-y-2">
              {resultado.habilidadesLacuna.slice(0, 6).map((h) => (
                <li key={h.codigo} className="flex items-start gap-2 text-sm">
                  <span className="shrink-0 text-[10px] font-black bg-blue-100 text-secondary px-1.5 py-0.5 rounded-md mt-0.5">{h.codigo}</span>
                  <span className="text-gray-600 leading-snug">{h.descricao}</span>
                </li>
              ))}
              {resultado.habilidadesLacuna.length > 6 && (
                <li className="text-xs text-gray-400 pl-2">+ {resultado.habilidadesLacuna.length - 6} outras habilidades</li>
              )}
            </ul>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
              <Zap className="w-3.5 h-3.5 text-accent" />
              Sua trilha foi personalizada com base nessas lacunas.
            </div>
          </div>
        )}

        {resultado.habilidadesLacuna.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <p className="font-bold text-green-700">Parabéns! Você domina todas as habilidades avaliadas!</p>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-3">
          <button
            onClick={() => router.push(`/estudante/trilha/${resultado.disciplina}`)}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-green-800 transition-colors"
          >
            Ir para minha trilha →
          </button>
          <button
            onClick={() => { setResultado(null); setStep('choose') }}
            className="w-full bg-gray-100 text-foreground py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Fazer diagnóstico de outra disciplina
          </button>
        </div>
      </div>
    )
  }

  return null
}
