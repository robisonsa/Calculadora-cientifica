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

  const habs       = (trilhaHabilidades ?? []) as TrilhaHabilidade[]
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
      <Link
        href="/estudante/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground mb-4 transition-colors font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      {/* Cabeçalho */}
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

      {habs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-card border border-gray-100">
          <div className="text-5xl mb-3">🎊</div>
          <p className="font-bold text-foreground mb-1">Incrível!</p>
          <p className="text-sm text-gray-400">Você já domina todos os conteúdos desta disciplina!</p>
        </div>
      )}

      {/* CAMINHO — estilo percurso */}
      {habs.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
          <div className="flex flex-col items-center px-4 pt-6 pb-8 gap-0">
            {habs.map((th, idx) => {
              const isDone       = th.status === 'concluida'
              const isInProgress = th.status === 'em_andamento'
              const isActive     = idx === activeIdx
              const canPlay      = isDone || isActive || isInProgress
              const nodeOnLeft   = idx % 2 === 0

              const xpEste = xpPorNivel(th.habilidade?.nivel_escala_saeb ?? 3)

              // Visual do nó
              let nodeRing: string
              let nodeFill: string
              let NodeIcon: React.ReactNode

              if (isDone) {
                nodeRing = 'border-[4px] border-secondary bg-blue-50 shadow-md'
                nodeFill = 'bg-secondary'
                NodeIcon = <CheckCircle className="w-6 h-6 text-white" />
              } else if (isActive || isInProgress) {
                nodeRing = 'border-[4px] border-accent bg-orange-50 node-pulse shadow-lg shadow-orange-200'
                nodeFill = 'bg-accent'
                NodeIcon = isInProgress
                  ? <Flame className="w-7 h-7 text-white" />
                  : <Star className="w-7 h-7 text-white fill-white" />
              } else {
                nodeRing = 'border-[4px] border-gray-200 bg-gray-50'
                nodeFill = 'bg-gray-300'
                NodeIcon = <Lock className="w-5 h-5 text-white/80" />
              }

              const nodeSize  = (isActive || isInProgress) ? 'w-24 h-24' : 'w-20 h-20'
              const innerSize = (isActive || isInProgress) ? 'w-14 h-14' : 'w-11 h-11'

              // Cor do conector acima deste nó
              const prevDone = idx > 0 && habs[idx - 1].status === 'concluida'
              const connColor = prevDone ? 'bg-secondary' : 'bg-gray-200'

              return (
                <div key={th.id} className="w-full flex flex-col items-center">
                  {/* Conector vertical */}
                  {idx > 0 && (
                    <div className={`w-1.5 h-10 ${connColor} rounded-full`} />
                  )}

                  {/* Linha: nó + rótulo alternando lado */}
                  <div className={`flex items-center gap-3 w-full max-w-[18rem] ${nodeOnLeft ? '' : 'flex-row-reverse'}`}>

                    {/* Círculo do nó */}
                    {canPlay ? (
                      <Link
                        href={`/estudante/atividade/${th.habilidade_id}`}
                        className={`shrink-0 ${nodeSize} rounded-full ${nodeRing} flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200`}
                      >
                        <div className={`${innerSize} rounded-full ${nodeFill} flex items-center justify-center`}>
                          {NodeIcon}
                        </div>
                      </Link>
                    ) : (
                      <div className={`shrink-0 ${nodeSize} rounded-full ${nodeRing} flex items-center justify-center`}>
                        <div className={`${innerSize} rounded-full ${nodeFill} flex items-center justify-center`}>
                          {NodeIcon}
                        </div>
                      </div>
                    )}

                    {/* Rótulo */}
                    <div className={`flex-1 min-w-0 ${nodeOnLeft ? 'text-left' : 'text-right'}`}>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md inline-block ${
                        isDone             ? 'bg-blue-100 text-secondary' :
                        (isActive || isInProgress) ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {th.habilidade?.codigo}
                      </span>
                      <p className={`text-xs font-bold leading-snug mt-0.5 ${
                        isDone             ? 'text-gray-500' :
                        (isActive || isInProgress) ? 'text-foreground' :
                        'text-gray-400'
                      }`}>
                        {th.habilidade?.descricao}
                      </p>
                      <p className={`text-[10px] mt-0.5 font-semibold ${isDone ? 'text-amber-500' : 'text-gray-400'}`}>
                        {isDone ? `✓ +${th.xp_conquistado} XP` : `${xpEste} XP`}
                      </p>

                      {/* Botão de ação para o nó ativo */}
                      {(isActive || isInProgress) && (
                        <Link
                          href={`/estudante/atividade/${th.habilidade_id}`}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-black bg-accent text-white px-3 py-1.5 rounded-full shadow-md hover:opacity-90 transition-opacity"
                        >
                          {isInProgress ? '🔥 Continuar' : '⭐ Iniciar'}
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
