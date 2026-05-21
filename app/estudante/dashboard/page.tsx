import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { XPBar } from '@/components/XPBar'
import { InsigniaCard } from '@/components/InsigniaCard'
import { BookOpen, Calculator, ChevronRight, Plus, Trophy } from 'lucide-react'

export default async function EstudanteDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Diagnósticos concluídos
  const { data: diagnosticos } = await supabase
    .from('diagnosticos')
    .select('*')
    .eq('estudante_id', user.id)
    .eq('concluido', true)

  const diagLP = diagnosticos?.find((d) => d.disciplina === 'lp')
  const diagMat = diagnosticos?.find((d) => d.disciplina === 'matematica')

  // Se nenhum diagnóstico feito, redireciona
  if (!diagnosticos || diagnosticos.length === 0) {
    redirect('/estudante/diagnostico')
  }

  // Trilhas
  const { data: trilhas } = await supabase
    .from('trilhas')
    .select('*')
    .eq('estudante_id', user.id)

  const trilhaLP = trilhas?.find((t) => t.disciplina === 'lp')
  const trilhaMat = trilhas?.find((t) => t.disciplina === 'matematica')
  const xpTotal = (trilhaLP?.xp_acumulado ?? 0) + (trilhaMat?.xp_acumulado ?? 0)
  const xpPossivel = (trilhaLP?.xp_total_possivel ?? 0) + (trilhaMat?.xp_total_possivel ?? 0)

  // Insígnias
  const { data: insigniasEstudante } = await supabase
    .from('estudante_insignias')
    .select('*, insignia:insignias(*)')
    .eq('estudante_id', user.id)

  const { data: todasInsignias } = await supabase.from('insignias').select('*')

  const primeiroNome = profile.nome_completo.split(' ')[0]

  return (
    <div className="space-y-8">
      {/* Boas-vindas */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Olá de volta! 👋</p>
            <h1 className="text-2xl font-bold">{primeiroNome}</h1>
            <p className="text-blue-100 text-sm mt-1">Continue sua jornada rumo ao SAEB</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold">{xpTotal}</div>
            <div className="text-blue-200 text-sm">XP acumulados</div>
          </div>
        </div>
        <div className="mt-5">
          <XPBar xp={xpTotal} maxXP={xpPossivel > 0 ? xpPossivel : 100} showLabel={false} size="sm" />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-blue-200">Progresso geral</span>
            <span className="text-xs text-blue-200">
              {xpPossivel > 0 ? Math.round((xpTotal / xpPossivel) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Trilhas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Minhas Trilhas</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Trilha LP */}
          <TrilhaCard
            disciplina="lp"
            icon={<BookOpen className="w-5 h-5 text-blue-600" />}
            titulo="Língua Portuguesa"
            diagnosticoFeito={!!diagLP}
            trilha={trilhaLP}
            nivelInicial={diagLP?.nivel_identificado}
          />
          {/* Trilha Matemática */}
          <TrilhaCard
            disciplina="matematica"
            icon={<Calculator className="w-5 h-5 text-purple-600" />}
            titulo="Matemática"
            diagnosticoFeito={!!diagMat}
            trilha={trilhaMat}
            nivelInicial={diagMat?.nivel_identificado}
          />
        </div>
      </div>

      {/* Insígnias */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-bold text-foreground">Insígnias</h2>
          <span className="text-sm text-gray-400">
            ({insigniasEstudante?.length ?? 0}/{todasInsignias?.length ?? 0} conquistadas)
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {todasInsignias?.map((insignia) => {
            const conquistada = insigniasEstudante?.find((ei) => ei.insignia_id === insignia.id)
            return (
              <InsigniaCard
                key={insignia.id}
                insignia={insignia}
                conquistada={!!conquistada}
                dataConquista={conquistada?.conquistada_em}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TrilhaCard({
  disciplina,
  icon,
  titulo,
  diagnosticoFeito,
  trilha,
  nivelInicial,
}: {
  disciplina: string
  icon: React.ReactNode
  titulo: string
  diagnosticoFeito: boolean
  trilha: { xp_acumulado: number; xp_total_possivel: number; concluida: boolean } | null | undefined
  nivelInicial?: number | null
}) {
  if (!diagnosticoFeito) {
    return (
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-foreground">{titulo}</p>
          <p className="text-sm text-gray-400 mt-1">Diagnóstico não realizado</p>
        </div>
        <Link
          href="/estudante/diagnostico"
          className="flex items-center gap-1.5 text-sm bg-primary text-white px-4 py-2 rounded-xl hover:bg-green-800 transition-colors font-semibold"
        >
          <Plus className="w-4 h-4" />
          Fazer diagnóstico
        </Link>
      </div>
    )
  }

  const xp = trilha?.xp_acumulado ?? 0
  const maxXP = trilha?.xp_total_possivel ?? 0
  const pct = maxXP > 0 ? Math.round((xp / maxXP) * 100) : 0

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="font-bold text-foreground">{titulo}</p>
          {nivelInicial && (
            <p className="text-xs text-gray-400">Nível SAEB inicial: {nivelInicial}</p>
          )}
        </div>
      </div>

      <XPBar xp={xp} maxXP={maxXP > 0 ? maxXP : 100} showLabel={false} size="sm" />
      <div className="flex justify-between mt-1.5 mb-4">
        <span className="text-xs text-gray-400">{pct}% concluído</span>
        <span className="text-xs font-semibold text-amber-600">{xp} XP</span>
      </div>

      <Link
        href={`/estudante/trilha/${disciplina}`}
        className="w-full flex items-center justify-center gap-1.5 text-sm bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-green-800 transition-colors font-semibold"
      >
        {pct === 100 ? 'Ver trilha concluída' : 'Continuar trilha'}
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
