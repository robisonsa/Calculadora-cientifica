'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, CheckCircle, AlertCircle, Trophy, RefreshCw } from 'lucide-react'
import type { Questao, Habilidade, Gabarito, TrilhaHabilidade, Insignia } from '@/lib/types/database'

type ActivityStep = 'loading' | 'quiz' | 'result' | 'insignia'

interface QuestaoLocal extends Questao {
  habilidade: Habilidade
}

const PASSING_SCORE = 4
const TOTAL_QUESTIONS = 5

export default function AtividadePage() {
  const { habilidade_id } = useParams() as { habilidade_id: string }
  const router = useRouter()

  const [step, setStep] = useState<ActivityStep>('loading')
  const [habilidade, setHabilidade] = useState<Habilidade | null>(null)
  const [questoes, setQuestoes] = useState<QuestaoLocal[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, Gabarito>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<Gabarito | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [trilhaHabilidade, setTrilhaHabilidade] = useState<TrilhaHabilidade | null>(null)
  const [novasInsignias, setNovasInsignias] = useState<Insignia[]>([])
  const [xpGanho, setXpGanho] = useState(0)
  const [acertosFinal, setAcertosFinal] = useState(0)

  useEffect(() => {
    loadAtividade()
  }, [habilidade_id])

  async function loadAtividade() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: hab } = await supabase
      .from('habilidades')
      .select('*')
      .eq('id', habilidade_id)
      .single()

    if (!hab) return
    setHabilidade(hab)

    // Buscar questões da habilidade
    const { data: questoesData } = await supabase
      .from('questoes')
      .select('*')
      .eq('habilidade_id', habilidade_id)
      .limit(TOTAL_QUESTIONS)

    if (!questoesData || questoesData.length === 0) {
      alert('Nenhuma questão cadastrada para esta habilidade.')
      return
    }

    // Embaralhar
    const shuffled = [...questoesData].sort(() => Math.random() - 0.5)
    setQuestoes(shuffled.slice(0, TOTAL_QUESTIONS).map((q) => ({ ...q, habilidade: hab })))

    // Buscar trilha_habilidade
    const { data: trilha } = await supabase
      .from('trilhas')
      .select('id')
      .eq('estudante_id', user.id)
      .eq('disciplina', hab.disciplina)
      .single()

    if (trilha) {
      const { data: th } = await supabase
        .from('trilha_habilidades')
        .select('*')
        .eq('trilha_id', trilha.id)
        .eq('habilidade_id', habilidade_id)
        .single()

      if (th) {
        setTrilhaHabilidade(th)
        // Marcar como em_andamento se não iniciada
        if (th.status === 'nao_iniciada') {
          await supabase
            .from('trilha_habilidades')
            .update({ status: 'em_andamento' })
            .eq('id', th.id)
        }
      }
    }

    setCurrentIndex(0)
    setRespostas({})
    setSelectedAnswer(null)
    setShowFeedback(false)
    setStep('quiz')
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
      await finalizarAtividade()
    }
  }

  async function finalizarAtividade() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !habilidade || !trilhaHabilidade) return

    const acertos = questoes.filter((q) => respostas[q.id] === q.gabarito).length
    setAcertosFinal(acertos)
    const passou = acertos >= PASSING_SCORE

    function xpPorNivel(n: number) {
      if (n <= 3) return 100
      if (n <= 6) return 150
      return 200
    }

    const xp = passou && trilhaHabilidade.xp_conquistado === 0
      ? xpPorNivel(habilidade.nivel_escala_saeb)
      : 0

    setXpGanho(xp)

    // Atualizar trilha_habilidade
    await supabase
      .from('trilha_habilidades')
      .update({
        status: passou ? 'concluida' : 'em_andamento',
        tentativas: trilhaHabilidade.tentativas + 1,
        acertos: trilhaHabilidade.acertos + acertos,
        xp_conquistado: trilhaHabilidade.xp_conquistado + xp,
      })
      .eq('id', trilhaHabilidade.id)

    // Atualizar XP da trilha
    if (xp > 0) {
      const { data: trilha } = await supabase
        .from('trilhas')
        .select('*')
        .eq('id', trilhaHabilidade.trilha_id)
        .single()

      if (trilha) {
        const novoXP = trilha.xp_acumulado + xp

        // Verificar se trilha foi concluída
        const { data: todasTH } = await supabase
          .from('trilha_habilidades')
          .select('id, status')
          .eq('trilha_id', trilha.id)

        const todasConcluidas = todasTH?.every((th: { id: string; status: string }) =>
          th.id === trilhaHabilidade.id ? passou : th.status === 'concluida'
        )

        await supabase
          .from('trilhas')
          .update({
            xp_acumulado: novoXP,
            concluida: todasConcluidas ?? false,
          })
          .eq('id', trilha.id)
      }

      // Verificar e conceder insígnias
      const insigniasGanhas = await verificarInsignias(user.id, supabase)
      setNovasInsignias(insigniasGanhas)
      if (insigniasGanhas.length > 0) {
        setStep('insignia')
        return
      }
    }

    setStep('result')
  }

  async function verificarInsignias(estudanteId: string, supabase: ReturnType<typeof createClient>): Promise<Insignia[]> {
    const { data: todasInsignias } = await supabase.from('insignias').select('*')
    const { data: insigniasExistentes } = await supabase
      .from('estudante_insignias')
      .select('insignia_id')
      .eq('estudante_id', estudanteId)

    const idsExistentes = new Set(insigniasExistentes?.map((i) => i.insignia_id) ?? [])
    const { data: todasTrilhas } = await supabase
      .from('trilhas')
      .select('*, trilha_habilidades(*)')
      .eq('estudante_id', estudanteId)

    const ganhas: Insignia[] = []

    for (const insignia of todasInsignias ?? []) {
      if (idsExistentes.has(insignia.id)) continue

      let criterioAtendido = false

      // Verificar critérios
      if (insignia.nome === 'Primeiro Passo') {
        const { data: concluidas } = await supabase
          .from('trilha_habilidades')
          .select('id')
          .eq('status', 'concluida')
          .in('trilha_id', todasTrilhas?.map((t) => t.id) ?? [])
        criterioAtendido = (concluidas?.length ?? 0) >= 1
      } else if (insignia.nome === 'Metade do Caminho') {
        criterioAtendido = todasTrilhas?.some((t) => {
          const ths = t.trilha_habilidades ?? []
          if (ths.length === 0) return false
          const conc = ths.filter((th: { status: string }) => th.status === 'concluida').length
          return conc / ths.length >= 0.5
        }) ?? false
      } else if (insignia.nome === 'Chegada') {
        criterioAtendido = todasTrilhas?.some((t) => t.concluida) ?? false
      } else if (insignia.nome === 'Mestre das Palavras') {
        criterioAtendido = todasTrilhas?.some((t) => t.disciplina === 'lp' && t.concluida) ?? false
      } else if (insignia.nome === 'Calculista') {
        criterioAtendido = todasTrilhas?.some((t) => t.disciplina === 'matematica' && t.concluida) ?? false
      } else if (insignia.nome === 'GPS Completo') {
        const lpConcluida = todasTrilhas?.some((t) => t.disciplina === 'lp' && t.concluida)
        const matConcluida = todasTrilhas?.some((t) => t.disciplina === 'matematica' && t.concluida)
        criterioAtendido = !!(lpConcluida && matConcluida)
      }

      if (criterioAtendido) {
        await supabase.from('estudante_insignias').insert({
          estudante_id: estudanteId,
          insignia_id: insignia.id,
        })
        ganhas.push(insignia)
      }
    }

    return ganhas
  }

  function handleRetry() {
    loadAtividade()
  }

  // Loading
  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Carregando atividade...</p>
        </div>
      </div>
    )
  }

  // Insígnias ganhas
  if (step === 'insignia') {
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-gradient-to-br from-accent to-yellow-400 rounded-2xl p-8 shadow-lg">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-white mb-2">Insígnia desbloqueada!</h2>
          <div className="flex justify-center gap-4 my-5">
            {novasInsignias.map((ins) => (
              <div key={ins.id} className="bg-white/30 backdrop-blur rounded-2xl p-4 flex flex-col items-center gap-2">
                <span className="text-4xl">{ins.icone_emoji}</span>
                <span className="text-white font-bold text-sm">{ins.nome}</span>
              </div>
            ))}
          </div>
          <p className="text-yellow-100 text-sm mb-6">+{novasInsignias.reduce((s, i) => s + i.xp_bonus, 0)} XP de bônus!</p>
          <button
            onClick={() => setStep('result')}
            className="bg-white text-foreground px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Ver resultado
          </button>
        </div>
      </div>
    )
  }

  // Resultado
  if (step === 'result') {
    const passou = acertosFinal >= PASSING_SCORE
    return (
      <div className="max-w-lg mx-auto">
        <div className={`rounded-2xl border-2 p-8 text-center ${passou ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-200'}`}>
          <div className="text-5xl mb-4">{passou ? '🎉' : '💪'}</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {passou ? 'Habilidade concluída!' : 'Quase lá!'}
          </h2>
          <div className="flex items-center justify-center gap-2 text-4xl font-extrabold my-4">
            <span className={passou ? 'text-success' : 'text-red-500'}>{acertosFinal}</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-400">{TOTAL_QUESTIONS}</span>
          </div>
          <p className="text-gray-500 text-sm mb-2">
            {passou
              ? `Você acertou ${acertosFinal} de ${TOTAL_QUESTIONS} questões. Excelente!`
              : `Você precisa de ${PASSING_SCORE} acertos para concluir. Tente novamente!`}
          </p>
          {xpGanho > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 inline-block mt-2 mb-4">
              <span className="font-bold text-accent">+{xpGanho} XP</span> conquistados!
            </div>
          )}

          <div className="space-y-3 mt-6">
            {!passou && (
              <button
                onClick={handleRetry}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </button>
            )}
            <Link
              href={`/estudante/trilha/${habilidade?.disciplina}`}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-foreground py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para a trilha
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Quiz
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
      {/* Header da atividade */}
      <div className="mb-6">
        <Link
          href={`/estudante/trilha/${habilidade?.disciplina}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a trilha
        </Link>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-sm">
            {habilidade?.codigo}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{habilidade?.descricao}</p>
            <p className="text-xs text-gray-400">Nível SAEB {habilidade?.nivel_escala_saeb} · {habilidade?.eixo}</p>
          </div>
        </div>
      </div>

      {/* Progresso */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-500">
            Questão {currentIndex + 1} de {questoes.length}
          </span>
          <span className="text-xs text-gray-400">
            Precisas de {PASSING_SCORE}/{TOTAL_QUESTIONS} para concluir
          </span>
        </div>
        <div className="flex gap-1.5">
          {questoes.map((q, i) => {
            const respondida = respostas[q.id]
            const acertou = respondida === q.gabarito
            return (
              <div
                key={q.id}
                className={`flex-1 h-2 rounded-full ${
                  i < currentIndex
                    ? acertou ? 'bg-success' : 'bg-red-400'
                    : i === currentIndex ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            )
          })}
        </div>
      </div>

      {/* Questão */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
        <p className="text-foreground font-medium leading-relaxed">{questao?.enunciado}</p>
      </div>

      {/* Alternativas */}
      <div className="space-y-3 mb-5">
        {alternativas.map((alt) => {
          let classes = 'w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-sm transition-all flex items-start gap-3 '
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
              <span className="font-bold uppercase w-5 flex-shrink-0">{alt.key})</span>
              <span>{alt.texto}</span>
              {showFeedback && alt.key === questao.gabarito && (
                <CheckCircle className="w-4 h-4 text-success ml-auto flex-shrink-0" />
              )}
              {showFeedback && alt.key === selectedAnswer && selectedAnswer !== questao.gabarito && (
                <AlertCircle className="w-4 h-4 text-red-500 ml-auto flex-shrink-0" />
              )}
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
            {isCorrect ? 'Correto! Muito bem! 🎯' : `Incorreto. A resposta certa é: ${questao.gabarito.toUpperCase()}`}
          </p>
        </div>
      )}

      {!showFeedback ? (
        <button
          onClick={handleConfirmAnswer}
          disabled={!selectedAnswer}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmar resposta
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          {currentIndex < questoes.length - 1 ? 'Próxima questão →' : 'Ver resultado'}
        </button>
      )}
    </div>
  )
}
