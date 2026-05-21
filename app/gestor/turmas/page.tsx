import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, ChevronRight, TrendingUp } from 'lucide-react'

export default async function GestorTurmasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: turmas } = await supabase
    .from('turmas')
    .select('*, professor:profiles!professor_id(nome_completo)')
    .order('nome')

  const { data: estudantes } = await supabase
    .from('profiles')
    .select('id, turma_id')
    .eq('role', 'estudante')

  const { data: trilhas } = await supabase
    .from('trilhas')
    .select('estudante_id, xp_acumulado, xp_total_possivel, concluida')

  function getTurmaStats(turmaId: string) {
    const estudantesDaTurma = estudantes?.filter((e) => e.turma_id === turmaId) ?? []
    const ids = estudantesDaTurma.map((e) => e.id)
    const trilhasDaTurma = trilhas?.filter((t) => ids.includes(t.estudante_id)) ?? []

    const xpMedio = ids.length > 0 && trilhasDaTurma.length > 0
      ? Math.round(trilhasDaTurma.reduce((s, t) => s + t.xp_acumulado, 0) / ids.length)
      : 0

    const pctTrilha = trilhasDaTurma.length > 0
      ? Math.round(
          trilhasDaTurma.reduce((s, t) => {
            return s + (t.xp_total_possivel > 0 ? t.xp_acumulado / t.xp_total_possivel : 0)
          }, 0) / trilhasDaTurma.length * 100
        )
      : 0

    return { total: ids.length, xpMedio, pctTrilha }
  }

  // Ordenar por avanço médio
  const turmasComStats = (turmas ?? []).map((t) => ({
    ...t,
    stats: getTurmaStats(t.id),
  })).sort((a, b) => b.stats.pctTrilha - a.stats.pctTrilha)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ranking de Turmas</h1>
        <p className="text-gray-500 text-sm mt-1">Ordenado por avanço médio nas trilhas</p>
      </div>

      <div className="space-y-4">
        {turmasComStats.map((turma, index) => (
          <Link key={turma.id} href={`/professor/turmas/${turma.id}`}>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all hover:border-primary flex items-center gap-5 cursor-pointer">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                index === 0 ? 'bg-accent' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-200 text-gray-500'
              }`}>
                {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-foreground">{turma.nome}</span>
                  <span className="text-xs text-gray-400">{turma.stats.total} estudantes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      index === 0 ? 'bg-accent' : 'bg-primary'
                    }`}
                    style={{ width: `${turma.stats.pctTrilha}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="text-lg font-extrabold text-foreground">{turma.stats.pctTrilha}%</div>
                  <div className="text-xs text-gray-400">Avanço médio</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-accent">{turma.stats.xpMedio}</div>
                  <div className="text-xs text-gray-400">XP médio</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
