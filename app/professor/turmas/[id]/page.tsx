import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, CheckCircle2, Circle, Clock, ChevronRight } from 'lucide-react'

export default async function TurmaDetalhePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: turma } = await supabase.from('turmas').select('*').eq('id', params.id).single()
  if (!turma) notFound()

  const { data: estudantes } = await supabase
    .from('profiles')
    .select('*')
    .eq('turma_id', params.id)
    .eq('role', 'estudante')
    .order('nome_completo')

  const estudantesIds = estudantes?.map((e) => e.id) ?? []

  // Diagnosticos concluídos
  const { data: diagnosticos } = estudantesIds.length > 0
    ? await supabase.from('diagnosticos').select('*').in('estudante_id', estudantesIds).eq('concluido', true)
    : { data: [] }

  // Trilhas
  const { data: trilhas } = estudantesIds.length > 0
    ? await supabase.from('trilhas').select('*').in('estudante_id', estudantesIds)
    : { data: [] }

  // Trilha habilidades (para calcular progresso)
  const trilhaIds = trilhas?.map((t) => t.id) ?? []
  const { data: trilhaHabilidades } = trilhaIds.length > 0
    ? await supabase.from('trilha_habilidades').select('trilha_id, status').in('trilha_id', trilhaIds)
    : { data: [] }

  // Insígnias
  const { data: insignias } = estudantesIds.length > 0
    ? await supabase.from('estudante_insignias').select('estudante_id').in('estudante_id', estudantesIds)
    : { data: [] }

  function getEstudanteData(estudanteId: string) {
    const diags = diagnosticos?.filter((d) => d.estudante_id === estudanteId) ?? []
    const trilhasEstudante = trilhas?.filter((t) => t.estudante_id === estudanteId) ?? []
    const xpTotal = trilhasEstudante.reduce((sum, t) => sum + t.xp_acumulado, 0)
    const insigniasCount = insignias?.filter((i) => i.estudante_id === estudanteId).length ?? 0

    const ths = trilhasEstudante.flatMap((t) =>
      trilhaHabilidades?.filter((th) => th.trilha_id === t.id) ?? []
    )
    const totalHabilidades = ths.length
    const concluidasHabilidades = ths.filter((th) => th.status === 'concluida').length
    const pctTrilha = totalHabilidades > 0 ? Math.round((concluidasHabilidades / totalHabilidades) * 100) : 0

    const nivelLP = diags.find((d) => d.disciplina === 'lp')?.nivel_identificado
    const nivelMat = diags.find((d) => d.disciplina === 'matematica')?.nivel_identificado

    return { xpTotal, insigniasCount, pctTrilha, nivelLP, nivelMat, temDiag: diags.length > 0 }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/professor/turmas" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar para turmas
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Turma {turma.nome}</h1>
            <p className="text-gray-400 text-sm">{turma.ano_letivo} · {estudantes?.length ?? 0} estudantes</p>
          </div>
        </div>
      </div>

      {/* Tabela de estudantes */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-foreground">Estudantes</h2>
        </div>

        {!estudantes || estudantes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Nenhum estudante nesta turma</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estudante</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nível LP</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nível MAT</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Trilha</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">XP</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">🏆</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {estudantes.map((estudante) => {
                  const data = getEstudanteData(estudante.id)
                  return (
                    <tr key={estudante.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground text-sm">{estudante.nome_completo}</div>
                        {!data.temDiag && (
                          <span className="text-xs text-amber-500">Aguardando diagnóstico</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {data.nivelLP ? (
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg font-semibold text-xs">
                            Nível {data.nivelLP}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {data.nivelMat ? (
                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg font-semibold text-xs">
                            Nível {data.nivelMat}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 bg-primary rounded-full"
                              style={{ width: `${data.pctTrilha}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{data.pctTrilha}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-amber-600">{data.xpTotal}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{data.insigniasCount}</td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/professor/estudante/${estudante.id}`}
                          className="flex items-center gap-1 text-xs text-primary hover:text-blue-700 font-semibold"
                        >
                          Ver <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
