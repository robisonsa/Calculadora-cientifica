import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, CheckCircle2, Circle, Clock } from 'lucide-react'
import type { TrilhaHabilidade } from '@/lib/types/database'

export default async function ProfessorEstudantePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: estudante } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('role', 'estudante')
    .single()

  if (!estudante) notFound()

  const { data: diagnosticos } = await supabase
    .from('diagnosticos')
    .select('*')
    .eq('estudante_id', params.id)
    .eq('concluido', true)

  const { data: trilhas } = await supabase
    .from('trilhas')
    .select('*')
    .eq('estudante_id', params.id)

  const { data: insignias } = await supabase
    .from('estudante_insignias')
    .select('*, insignia:insignias(*)')
    .eq('estudante_id', params.id)

  const trilhaIds = trilhas?.map((t) => t.id) ?? []
  const { data: allTH } = trilhaIds.length > 0
    ? await supabase
        .from('trilha_habilidades')
        .select('*, habilidade:habilidades(*)')
        .in('trilha_id', trilhaIds)
    : { data: [] }

  const xpTotal = trilhas?.reduce((sum, t) => sum + t.xp_acumulado, 0) ?? 0

  function getTH(disciplina: string): TrilhaHabilidade[] {
    const trilha = trilhas?.find((t) => t.disciplina === disciplina)
    if (!trilha) return []
    return (allTH?.filter((th) => th.trilha_id === trilha.id) ?? []) as TrilhaHabilidade[]
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/professor/turmas" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">{estudante.nome_completo}</h1>
              <p className="text-gray-400 text-sm">{estudante.escola}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-primary">{xpTotal}</div>
                <div className="text-xs text-gray-400">XP Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-accent">{insignias?.length ?? 0}</div>
                <div className="text-xs text-gray-400">Insígnias</div>
              </div>
            </div>
          </div>

          {/* Diagnósticos */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            {[
              { disc: 'lp', label: 'Língua Portuguesa', emoji: '📖' },
              { disc: 'matematica', label: 'Matemática', emoji: '🔢' },
            ].map(({ disc, label, emoji }) => {
              const diag = diagnosticos?.find((d) => d.disciplina === disc)
              return (
                <div key={disc} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{emoji}</span>
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                  </div>
                  {diag ? (
                    <p className="text-xs text-gray-500">
                      Nível inicial SAEB: <strong className="text-primary">Nível {diag.nivel_identificado}</strong>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">Diagnóstico não realizado</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Habilidades por disciplina */}
      {[
        { label: 'Língua Portuguesa', disc: 'lp', emoji: '📖' },
        { label: 'Matemática', disc: 'matematica', emoji: '🔢' },
      ].map(({ label, disc, emoji }) => {
        const ths = getTH(disc)
        if (ths.length === 0) return null
        const concluidas = ths.filter((th) => th.status === 'concluida').length

        return (
          <div key={disc} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <span>{emoji}</span>
              <h2 className="font-semibold text-foreground">{label}</h2>
              <span className="ml-auto text-sm text-gray-400">{concluidas}/{ths.length}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {ths.map((th) => (
                <div key={th.id} className="px-5 py-3.5 flex items-center gap-3">
                  {th.status === 'concluida' && <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />}
                  {th.status === 'em_andamento' && <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                  {th.status === 'nao_iniciada' && <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-primary font-bold">{th.habilidade?.codigo}</span>
                      {' · '}
                      {th.habilidade?.descricao}
                    </p>
                    <p className="text-xs text-gray-400">{th.habilidade?.eixo} · Nível {th.habilidade?.nivel_escala_saeb}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {th.status === 'concluida' && <span className="text-xs text-success font-bold">+{th.xp_conquistado} XP</span>}
                    {th.status !== 'concluida' && th.tentativas > 0 && (
                      <span className="text-xs text-gray-400">{th.tentativas} tent.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Insígnias */}
      {insignias && insignias.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-foreground mb-3">🏆 Insígnias ({insignias.length})</h2>
          <div className="flex flex-wrap gap-3">
            {insignias.map((ei) => (
              <div key={ei.id} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <span className="text-xl">{(ei as { insignia?: { icone_emoji: string } }).insignia?.icone_emoji}</span>
                <div>
                  <p className="text-xs font-bold text-foreground">{(ei as { insignia?: { nome: string } }).insignia?.nome}</p>
                  <p className="text-xs text-gray-400">{new Date(ei.conquistada_em).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
