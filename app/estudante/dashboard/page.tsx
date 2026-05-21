import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { XPBar } from '@/components/XPBar'
import { InsigniaCard } from '@/components/InsigniaCard'
import { BookOpen, Calculator, ChevronRight, Plus, Trophy, Zap, Star, Map } from 'lucide-react'
import Image from 'next/image'

function calcLevel(xp: number) {
  if (xp >= 1500) return { level: 5, name: 'Mestre GPS',   emoji: '🧠', next: xp,  prev: 1500 }
  if (xp >= 800)  return { level: 4, name: 'Especialista', emoji: '🎯', next: 1500, prev: 800  }
  if (xp >= 400)  return { level: 3, name: 'Praticante',   emoji: '⚡', next: 800,  prev: 400  }
  if (xp >= 150)  return { level: 2, name: 'Explorador',   emoji: '🔭', next: 400,  prev: 150  }
  return               { level: 1, name: 'Iniciante',     emoji: '🌱', next: 150,  prev: 0    }
}

export default async function EstudanteDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: diagnosticos } = await supabase
    .from('diagnosticos').select('*').eq('estudante_id', user.id).eq('concluido', true)

  if (!diagnosticos || diagnosticos.length === 0) redirect('/estudante/diagnostico')

  const { data: trilhas } = await supabase.from('trilhas').select('*').eq('estudante_id', user.id)
  const trilhaLP  = trilhas?.find((t) => t.disciplina === 'lp')
  const trilhaMat = trilhas?.find((t) => t.disciplina === 'matematica')
  const xpTotal   = (trilhaLP?.xp_acumulado ?? 0) + (trilhaMat?.xp_acumulado ?? 0)
  const xpPossivel = (trilhaLP?.xp_total_possivel ?? 0) + (trilhaMat?.xp_total_possivel ?? 0)

  const lvl = calcLevel(xpTotal)

  const { data: insigniasEstudante } = await supabase
    .from('estudante_insignias').select('*, insignia:insignias(*)').eq('estudante_id', user.id)
  const { data: todasInsignias } = await supabase.from('insignias').select('*')

  // Próxima habilidade a praticar
  const { data: proxHab } = await supabase
    .from('trilha_habilidades')
    .select('*, habilidade:habilidades(*), trilha:trilhas(disciplina)')
    .in('trilha_id', trilhas?.map((t) => t.id) ?? [])
    .neq('status', 'concluida')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  const primeiroNome = profile.nome_completo.split(' ')[0]
  const diagLP  = diagnosticos.find((d) => d.disciplina === 'lp')
  const diagMat = diagnosticos.find((d) => d.disciplina === 'matematica')

  return (
    <div className="space-y-6">
      {/* Hero gamificado */}
      <div className="relative bg-gradient-to-br from-primary via-green-700 to-secondary rounded-3xl p-6 shadow-xl overflow-hidden">
        {/* Decoração de fundo */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <p className="text-green-200 text-sm font-semibold mb-0.5">Olá, {primeiroNome}! 👋</p>
            <h1 className="text-2xl font-black text-white">Continue sua jornada</h1>
            <p className="text-green-100 text-sm mt-0.5">
              {lvl.emoji} {lvl.name} · Nível {lvl.level}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Zap className="w-5 h-5 text-amber-300" />
              <span className="text-3xl font-black text-white">{xpTotal.toLocaleString('pt-BR')}</span>
            </div>
            <div className="text-green-200 text-xs mt-0.5">XP acumulados</div>
          </div>
        </div>

        {/* Level bar */}
        <div className="relative z-10">
          <div className="flex justify-between text-xs text-green-200 mb-1.5 font-semibold">
            <span>{lvl.name}</span>
            <span>{lvl.level < 5 ? `${xpTotal - lvl.prev} / ${lvl.next - lvl.prev} XP para Nv.${lvl.level + 1}` : 'Nível máximo!'}</span>
          </div>
          <div className="h-3 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-3 rounded-full xp-shimmer transition-all duration-700"
              style={{ width: `${lvl.level < 5 ? Math.round(((xpTotal - lvl.prev) / (lvl.next - lvl.prev)) * 100) : 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Continue jogando */}
      {proxHab && (
        <Link
          href={`/estudante/atividade/${proxHab.habilidade_id}`}
          className="block bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                {proxHab.status === 'em_andamento' ? '🔥' : '▶️'}
              </div>
              <div>
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">
                  {proxHab.status === 'em_andamento' ? 'Continue de onde parou' : 'Próxima atividade'}
                </p>
                <p className="text-white font-black text-base">{proxHab.habilidade?.descricao}</p>
                <p className="text-white/70 text-xs mt-0.5">{proxHab.habilidade?.codigo} · {proxHab.habilidade?.eixo}</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white flex-shrink-0" />
          </div>
        </Link>
      )}

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 text-center shadow-card border border-gray-100">
          <div className="text-2xl font-black text-primary">
            {(trilhaLP ? (trilhaLP.xp_acumulado > 0 ? Math.round((trilhaLP.xp_acumulado / Math.max(trilhaLP.xp_total_possivel, 1)) * 100) : 0) : 0)}%
          </div>
          <div className="text-xs text-gray-500 font-semibold mt-1">LP</div>
          <div className="text-[10px] text-gray-400">progresso</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-card border border-gray-100">
          <div className="text-2xl font-black text-secondary">
            {(trilhaMat ? (trilhaMat.xp_acumulado > 0 ? Math.round((trilhaMat.xp_acumulado / Math.max(trilhaMat.xp_total_possivel, 1)) * 100) : 0) : 0)}%
          </div>
          <div className="text-xs text-gray-500 font-semibold mt-1">MAT</div>
          <div className="text-[10px] text-gray-400">progresso</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-card border border-gray-100">
          <div className="text-2xl font-black text-accent">{insigniasEstudante?.length ?? 0}</div>
          <div className="text-xs text-gray-500 font-semibold mt-1">🏆</div>
          <div className="text-[10px] text-gray-400">insígnias</div>
        </div>
      </div>

      {/* Trilhas */}
      <div>
        <h2 className="text-base font-black text-foreground mb-3 flex items-center gap-2">
          <Map className="w-4 h-4 text-primary" />
          Minhas Trilhas
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <TrilhaCard
            disciplina="lp"
            titulo="Língua Portuguesa"
            icon="📖"
            color="from-blue-500 to-blue-700"
            diagFeito={!!diagLP}
            trilha={trilhaLP}
            nivelInicial={diagLP?.nivel_identificado}
          />
          <TrilhaCard
            disciplina="matematica"
            titulo="Matemática"
            icon="🔢"
            color="from-purple-500 to-purple-700"
            diagFeito={!!diagMat}
            trilha={trilhaMat}
            nivelInicial={diagMat?.nivel_identificado}
          />
        </div>
      </div>

      {/* Insígnias recentes */}
      {(insigniasEstudante?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-base font-black text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" />
            Insígnias
            <span className="text-sm font-normal text-gray-400">
              {insigniasEstudante?.length}/{todasInsignias?.length}
            </span>
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {todasInsignias?.map((ins) => {
              const conquistada = insigniasEstudante?.find((ei) => ei.insignia_id === ins.id)
              return (
                <InsigniaCard
                  key={ins.id}
                  insignia={ins}
                  conquistada={!!conquistada}
                  dataConquista={conquistada?.conquistada_em}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function TrilhaCard({
  disciplina, titulo, icon, color, diagFeito, trilha, nivelInicial,
}: {
  disciplina: string; titulo: string; icon: string; color: string
  diagFeito: boolean
  trilha: { xp_acumulado: number; xp_total_possivel: number; concluida: boolean } | null | undefined
  nivelInicial?: number | null
}) {
  if (!diagFeito) {
    return (
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center">
        <span className="text-4xl">{icon}</span>
        <div>
          <p className="font-bold text-foreground">{titulo}</p>
          <p className="text-sm text-gray-400 mt-1">Diagnóstico não realizado</p>
        </div>
        <Link
          href="/estudante/diagnostico"
          className="flex items-center gap-1.5 text-sm bg-primary text-white px-4 py-2 rounded-xl hover:bg-green-800 transition-colors font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Fazer diagnóstico
        </Link>
      </div>
    )
  }

  const xp    = trilha?.xp_acumulado ?? 0
  const maxXP = trilha?.xp_total_possivel ?? 0
  const pct   = maxXP > 0 ? Math.round((xp / maxXP) * 100) : 0

  return (
    <Link
      href={`/estudante/trilha/${disciplina}`}
      className="block bg-white border border-gray-100 rounded-2xl shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${color} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl float">{icon}</span>
            <div>
              <p className="font-black text-white">{titulo}</p>
              {nivelInicial && (
                <p className="text-xs text-white/70">Nível SAEB inicial: {nivelInicial}</p>
              )}
            </div>
          </div>
          {trilha?.concluida && <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-foreground">{pct}% concluído</span>
          <span className="text-sm font-black text-amber-500">⚡ {xp} XP</span>
        </div>
        <XPBar xp={xp} maxXP={maxXP > 0 ? maxXP : 100} showLabel={false} size="sm" />
        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-primary">
          {pct === 100 ? 'Trilha concluída! 🎉' : 'Continuar trilha'}
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  )
}
