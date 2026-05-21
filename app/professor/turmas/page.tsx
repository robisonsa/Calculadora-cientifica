import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, ChevronRight, BookOpen, Calculator } from 'lucide-react'

export default async function ProfessorTurmasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  // Professor vê suas turmas, gestor vê todas
  const turmasQuery = supabase.from('turmas').select('*, professor:profiles!professor_id(nome_completo)')
  if (profile.role === 'professor') {
    turmasQuery.eq('professor_id', user.id)
  }

  const { data: turmas } = await turmasQuery

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Minhas Turmas</h1>
        <p className="text-gray-500 text-sm mt-1">Acompanhe o progresso dos seus estudantes</p>
      </div>

      {!turmas || turmas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Nenhuma turma encontrada</p>
          <p className="text-sm text-gray-300 mt-1">Execute o seed para adicionar turmas demo</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {turmas.map((turma) => (
            <TurmaCard key={turma.id} turma={turma} supabase={supabase} />
          ))}
        </div>
      )}
    </div>
  )
}

async function TurmaCard({ turma, supabase }: { turma: { id: string; nome: string; ano_letivo: number }; supabase: Awaited<ReturnType<typeof createClient>> }) {
  const { data: estudantes } = await supabase
    .from('profiles')
    .select('id')
    .eq('turma_id', turma.id)
    .eq('role', 'estudante')

  const estudanteIds = estudantes?.map((e) => e.id) ?? []

  const { data: diagnosticos } = estudanteIds.length > 0
    ? await supabase.from('diagnosticos').select('estudante_id').in('estudante_id', estudanteIds).eq('concluido', true)
    : { data: [] }

  const estudantesComDiag = new Set(diagnosticos?.map((d) => d.estudante_id)).size
  const pctDiag = estudanteIds.length > 0 ? Math.round((estudantesComDiag / estudanteIds.length) * 100) : 0

  const { data: trilhas } = estudanteIds.length > 0
    ? await supabase.from('trilhas').select('xp_acumulado').in('estudante_id', estudanteIds)
    : { data: [] }

  const xpMedio = trilhas && trilhas.length > 0
    ? Math.round(trilhas.reduce((sum, t) => sum + t.xp_acumulado, 0) / estudanteIds.length)
    : 0

  return (
    <Link href={`/professor/turmas/${turma.id}`}>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all hover:border-primary cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">{turma.nome}</h3>
                <p className="text-xs text-gray-400">{turma.ano_letivo}</p>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xl font-bold text-foreground">{estudanteIds.length}</div>
            <div className="text-xs text-gray-400">Estudantes</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="text-xl font-bold text-primary">{pctDiag}%</div>
            <div className="text-xs text-gray-400">Diagnósticos</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3">
            <div className="text-xl font-bold text-accent">{xpMedio}</div>
            <div className="text-xs text-gray-400">XP médio</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Diagnósticos realizados</span>
            <span>{estudantesComDiag}/{estudanteIds.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 bg-primary rounded-full transition-all"
              style={{ width: `${pctDiag}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
