import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

export default async function GestorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: estudantes } = await supabase
    .from('profiles')
    .select('id, turma_id')
    .eq('role', 'estudante')

  const estudanteIds = estudantes?.map((e) => e.id) ?? []

  const { data: diagnosticos } = estudanteIds.length > 0
    ? await supabase.from('diagnosticos').select('estudante_id, disciplina, nivel_identificado').in('estudante_id', estudanteIds).eq('concluido', true)
    : { data: [] }

  const { data: trilhas } = estudanteIds.length > 0
    ? await supabase.from('trilhas').select('estudante_id, xp_acumulado, xp_total_possivel, concluida').in('estudante_id', estudanteIds)
    : { data: [] }

  const { data: trilhaHabilidades } = await supabase
    .from('trilha_habilidades')
    .select('habilidade_id, status')

  const { data: habilidades } = await supabase.from('habilidades').select('id, codigo, descricao, eixo, disciplina')

  const { data: turmas } = await supabase.from('turmas').select('id, nome')

  // Métricas gerais
  const totalEstudantes = estudanteIds.length
  const estudantesComDiag = new Set(diagnosticos?.map((d) => d.estudante_id)).size
  const pctDiag = totalEstudantes > 0 ? Math.round((estudantesComDiag / totalEstudantes) * 100) : 0
  const xpMedioGeral = trilhas && trilhas.length > 0 && totalEstudantes > 0
    ? Math.round(trilhas.reduce((sum, t) => sum + t.xp_acumulado, 0) / totalEstudantes)
    : 0

  // Habilidades críticas (> 60% de lacuna)
  const lacunaPorHabilidade: Record<string, { total: number; naoConc: number }> = {}
  for (const th of trilhaHabilidades ?? []) {
    if (!lacunaPorHabilidade[th.habilidade_id]) {
      lacunaPorHabilidade[th.habilidade_id] = { total: 0, naoConc: 0 }
    }
    lacunaPorHabilidade[th.habilidade_id].total++
    if (th.status !== 'concluida') lacunaPorHabilidade[th.habilidade_id].naoConc++
  }

  const habilidadesCriticas = habilidades
    ?.filter((h) => {
      const stats = lacunaPorHabilidade[h.id]
      if (!stats || stats.total === 0) return false
      return stats.naoConc / stats.total > 0.6
    })
    .slice(0, 5) ?? []

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel de Gestão</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral da escola — CEGLB</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Estudantes ativos',
            value: totalEstudantes,
            icon: <Users className="w-5 h-5 text-blue-600" />,
            bg: 'bg-blue-50',
            color: 'text-blue-600',
          },
          {
            label: 'Diagnósticos feitos',
            value: `${pctDiag}%`,
            icon: <CheckCircle className="w-5 h-5 text-success" />,
            bg: 'bg-green-50',
            color: 'text-success',
          },
          {
            label: 'XP médio por estudante',
            value: xpMedioGeral,
            icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
            bg: 'bg-amber-50',
            color: 'text-amber-600',
          },
          {
            label: 'Habilidades críticas',
            value: habilidadesCriticas.length,
            icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
            bg: 'bg-red-50',
            color: 'text-red-500',
          },
        ].map((metric) => (
          <div key={metric.label} className={`${metric.bg} rounded-2xl p-5 border border-white`}>
            <div className="flex items-center gap-2 mb-3">{metric.icon}</div>
            <div className={`text-3xl font-extrabold ${metric.color}`}>{metric.value}</div>
            <div className="text-xs font-medium text-gray-500 mt-1">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Progresso por turma */}
      {turmas && turmas.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-foreground mb-4">Progresso por Turma</h2>
          <div className="space-y-4">
            {turmas.map((turma) => {
              const estudantesDaTurma = estudantes?.filter((e) => e.turma_id === turma.id) ?? []
              const idsNaTurma = estudantesDaTurma.map((e) => e.id)
              const diagNaTurma = diagnosticos?.filter((d) => idsNaTurma.includes(d.estudante_id)) ?? []
              const pct = idsNaTurma.length > 0 ? Math.round((new Set(diagNaTurma.map((d) => d.estudante_id)).size / idsNaTurma.length) * 100) : 0

              return (
                <div key={turma.id} className="flex items-center gap-4">
                  <Link href={`/professor/turmas/${turma.id}`} className="w-16 font-bold text-sm text-foreground hover:text-primary transition-colors">
                    {turma.nome}
                  </Link>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-10 text-right">{pct}%</span>
                  <span className="text-xs text-gray-400 w-20">{idsNaTurma.length} alunos</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Habilidades críticas */}
      {habilidadesCriticas.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-foreground">Habilidades com Maior Lacuna</h2>
          </div>
          <div className="space-y-3">
            {habilidadesCriticas.map((hab) => {
              const stats = lacunaPorHabilidade[hab.id]
              const pctLacuna = stats ? Math.round((stats.naoConc / stats.total) * 100) : 0
              return (
                <div key={hab.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded w-14 text-center">
                    {hab.codigo}
                  </span>
                  <p className="flex-1 text-sm text-foreground truncate">{hab.descricao}</p>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 bg-red-400 rounded-full"
                      style={{ width: `${pctLacuna}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-red-500 w-10 text-right">{pctLacuna}%</span>
                </div>
              )
            })}
          </div>
          <Link href="/gestor/habilidades" className="mt-4 inline-block text-sm text-primary font-semibold hover:underline">
            Ver mapa completo →
          </Link>
        </div>
      )}
    </div>
  )
}
