import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Lock, CheckCircle, Flame, Star, ChevronRight, Zap } from 'lucide-react'
import type { Disciplina, TrilhaHabilidade } from '@/lib/types/database'

function xpPorNivel(n: number) {
  if (n <= 3) return 100
  if (n <= 6) return 150
  return 200
}

export default async function TrilhaPage({ params }: { params: { disciplina: string } }) {
  const { disciplina } = params
  if (disciplina !== 'lp' && disciplina !== 'matematica') notFound()

  const disc = disciplina as Disciplina
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trilha } = await supabase
    .from('trilhas').select('*')
    .eq('estudante_id', user.id).eq('disciplina', disc).single()

  if (!trilha) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-7xl mb-5 float inline-block">🗺️</div>
        <h2 className="text-xl font-black text-foreground mb-2">Trilha não encontrada</h2>
        <p className="text-gray-500 mb-6">
          Faça o diagnóstico de {disc === 'lp' ? 'Língua Portuguesa' : 'Matemática'} para criar sua trilha personalizada.
        </p>
        <Link href="/estudante/diagnostico" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-green-800 transition-colors shadow-sm">
          Fazer diagnóstico
        </Link>
      </div>
    )
  }

  const { data: trilhaHabilidades } = await supabase
    .from('trilha_habilidades')
    .select('*, habilidade:habilidades(*)')
    .eq('trilha_id', trilha.id)
    .order('id', { ascending: true })

  const habs      = (trilhaHabilidades ?? []) as TrilhaHabilidade[]
  const concluidas = habs.filter((h) => h.status === 'concluida').length
  const total      = habs.length
  const pct        = total > 0 ? Math.round((concluidas / total) * 100) : 0
  const activeIdx  = habs.findIndex((h) => h.status !== 'concluida')

  const isLP     = disc === 'lp'
  const titulo   = isLP ? 'Língua Portuguesa' : 'Matemática'
  const gradient = isLP ? 'from-blue-600 to-blue-800' : 'from-purple-600 to-purple-800'
  const icon     = isLP ? '📖' : '🔢'

  return (
    <div className="max-w-md mx-auto">
      {/* Voltar */}
      <Link href="/estudante/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground mb-4 transition-colors font-semibold">
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      {/* Cabeçalho da trilha */}
      <div className={`bg-gradient-to-br ${gradient} rounded-3xl p-6 mb-6 shadow-xl text-white`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl float inline-block">{icon}</span>
          <div className="flex-1">
            <h1 className="text-xl font-black">{titulo}</h1>
            <p className="text-white/70 text-sm">{concluidas}/{total} habilidades concluídas</p>
          </div>
          {trilha.concluida && <Star className="w-6 h-6 text-yellow-300 fill-yellow-300 flex-shrink-0" />}
        </div>
        <div className="flex justify-between text-xs text-white/60 mb-1.5 font-semibold">
          <span>{pct}% concluído</span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-300" />
            {trilha.xp_acumulado} / {trilha.xp_total_possivel} XP
          </span>
        </div>
        <div className="h-3 bg-black/20 rounded-full overflow-hidden">
          <div className="h-3 rounded-full xp-shimmer transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Trilha concluída */}
      {trilha.concluida && (
        <div className="bg-gradient-to-r from-accent to-yellow-400 rounded-2xl p-5 text-center mb-6 shadow-lg">
          <div className="text-4xl mb-2">🏆</div>
          <p className="font-black text-white text-lg">Trilha concluída!</p>
          <p className="text-yellow-100 text-sm mt-1">Você dominou todas as habilidades desta disciplina!</p>
        </div>
      )}

      {/* Sem habilidades */}
      {habs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-card border border-gray-100">
          <div className="text-5xl mb-3">🎊</div>
          <p className="font-bold text-foreground mb-1">Incrível!</p>
          <p className="text-sm text-gray-400">Você já domina todos os conteúdos desta disciplina!</p>
        </div>
      )}

      {/* PATH ESTILO DUOLINGO */}
      {habs.length > 0 && (
        <div className="relative flex flex-col items-center pb-8">
          {/* Linha central do caminho */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gray-200 rounded-full" />

          {habs.map((th, idx) => {
            const isDone       = th.status === 'concluida'
            const isInProgress = th.status === 'em_andamento'
            const isActive     = idx === activeIdx
            const canPlay      = isDone || isActive || isInProgress

            // Alterna esquerda/direita
            const isLeft = idx % 2 === 0
            const offsetClass = isLeft ? '-translate-x-14 sm:-translate-x-20' : 'translate-x-14 sm:translate-x-20'

            // Estilos do nó
            let outerClass = ''
            let innerClass = ''
            let NodeIcon: React.ReactNode

            if (isDone) {
              outerClass = 'border-4 border-node-done bg-green-50 shadow-node-done'
              innerClass = 'bg-node-done'
              NodeIcon   = <CheckCircle className="w-7 h-7 text-white" />
            } else if (isInProgress || isActive) {
              outerClass = 'border-4 border-node-active bg-blue-50 node-pulse shadow-node-active'
              innerClass = 'bg-node-active'
              NodeIcon   = <Flame className="w-7 h-7 text-white" />
            } else {
              outerClass = 'border-4 border-gray-300 bg-gray-50'
              innerClass = 'bg-gray-400'
              NodeIcon   = <Lock className="w-6 h-6 text-white/80" />
            }

            return (
              <div key={th.id} className="relative z-10 w-full flex flex-col items-center">
                {/* Espaço top */}
                <div className="h-5" />

                {/* Nó */}
                <div className={`transform ${offsetClass} flex flex-col items-center gap-2`}>
                  {/* Círculo — clicável se disponível */}
                  {canPlay ? (
                    <Link
                      href={`/estudante/atividade/${th.habilidade_id}`}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 ${outerClass}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${innerClass}`}>
                        {NodeIcon}
                      </div>
                    </Link>
                  ) : (
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center cursor-default ${outerClass}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${innerClass}`}>
                        {NodeIcon}
                      </div>
                    </div>
                  )}

                  {/* Rótulo do nó */}
                  <div className="text-center w-36">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        isDone             ? 'bg-green-100 text-green-700' :
                        (isActive || isInProgress) ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {th.habilidade?.codigo}
                      </span>
                      <span className={`text-[10px] font-bold ${isDone ? 'text-amber-500' : 'text-gray-400'}`}>
                        {isDone ? `+${th.xp_conquistado} XP` : `${xpPorNivel(th.habilidade?.nivel_escala_saeb ?? 3)} XP`}
                      </span>
                    </div>
                    <p className={`text-xs font-bold leading-tight ${
                      isDone             ? 'text-gray-500' :
                      (isActive || isInProgress) ? 'text-foreground' :
                      'text-gray-400'
                    }`}>
                      {th.habilidade?.descricao}
                    </p>
                    {(isActive || isInProgress) && (
                      <Link
                        href={`/estudante/atividade/${th.habilidade_id}`}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-black bg-node-active text-white px-3 py-1.5 rounded-full shadow-sm hover:opacity-90 transition-opacity"
                      >
                        {isInProgress ? 'Continuar' : 'Iniciar'}
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Conector para o próximo nó */}
                {idx < habs.length - 1 && (
                  <div className="h-6 w-1 rounded-full mt-1 z-10"
                    style={{ backgroundColor: isDone ? '#58CC02' : '#e5e7eb' }}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
