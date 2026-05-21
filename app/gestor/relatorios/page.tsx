import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Download, FileText, Users, School } from 'lucide-react'

export default async function GestorRelatoriosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: turmas } = await supabase.from('turmas').select('id, nome').order('nome')
  const { data: estudantes } = await supabase
    .from('profiles')
    .select('id, nome_completo, turma_id')
    .eq('role', 'estudante')
    .order('nome_completo')

  const { data: trilhas } = await supabase.from('trilhas').select('estudante_id, disciplina, xp_acumulado, xp_total_possivel, concluida')
  const { data: diagnosticos } = await supabase.from('diagnosticos').select('estudante_id, disciplina, nivel_identificado').eq('concluido', true)

  function getEstudanteStats(id: string) {
    const t = trilhas?.filter((tr) => tr.estudante_id === id) ?? []
    const xp = t.reduce((s, tr) => s + tr.xp_acumulado, 0)
    const diagLP = diagnosticos?.find((d) => d.estudante_id === id && d.disciplina === 'lp')?.nivel_identificado
    const diagMat = diagnosticos?.find((d) => d.estudante_id === id && d.disciplina === 'matematica')?.nivel_identificado
    return { xp, diagLP, diagMat }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-gray-500 text-sm mt-1">Visão consolidada da escola e exportações</p>
      </div>

      {/* Relatório consolidado da escola */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <School className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-foreground">Escola — CEGLB</h2>
          <button
            className="ml-auto flex items-center gap-1.5 text-xs text-primary bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
            title="Funcionalidade de PDF disponível na versão completa"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar PDF
          </button>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total de estudantes', value: estudantes?.length ?? 0 },
            { label: 'Total de turmas', value: turmas?.length ?? 0 },
            {
              label: 'Diagnósticos LP',
              value: new Set(diagnosticos?.filter((d) => d.disciplina === 'lp').map((d) => d.estudante_id)).size,
            },
            {
              label: 'Diagnósticos MAT',
              value: new Set(diagnosticos?.filter((d) => d.disciplina === 'matematica').map((d) => d.estudante_id)).size,
            },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-foreground">{item.value}</div>
              <div className="text-xs text-gray-400 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Relatórios por turma */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <Users className="w-5 h-5 text-green-600" />
          <h2 className="font-bold text-foreground">Relatórios por Turma</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {turmas?.map((turma) => {
            const estudantesDaTurma = estudantes?.filter((e) => e.turma_id === turma.id) ?? []
            return (
              <div key={turma.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{turma.nome}</p>
                  <p className="text-xs text-gray-400">{estudantesDaTurma.length} estudantes</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/professor/turmas/${turma.id}`}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Ver detalhes →
                  </Link>
                  <button
                    className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    title="Exportar PDF — disponível na versão completa"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Relatórios por estudante */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <FileText className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-foreground">Relatórios Individuais</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">Estudante</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">Turma</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nível LP</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nível MAT</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">XP</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {estudantes?.map((estudante) => {
                const stats = getEstudanteStats(estudante.id)
                const turma = turmas?.find((t) => t.id === estudante.turma_id)
                return (
                  <tr key={estudante.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{estudante.nome_completo}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{turma?.nome ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {stats.diagLP ? (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">Nível {stats.diagLP}</span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {stats.diagMat ? (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold">Nível {stats.diagMat}</span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-bold text-amber-600">{stats.xp}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/professor/estudante/${estudante.id}`}
                        className="text-xs text-primary hover:underline font-semibold"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        💡 Exportação completa em PDF disponível na versão pós-hackathon com integração Puppeteer/react-pdf.
      </p>
    </div>
  )
}
