import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { XPBar } from '@/components/XPBar'
import { InsigniaCard } from '@/components/InsigniaCard'
import { CheckCircle2, Clock, Circle, BarChart2, Download } from 'lucide-react'
import type { TrilhaHabilidade } from '@/lib/types/database'

export default async function RelatorioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: trilhas } = await supabase.from('trilhas').select('*').eq('estudante_id', user.id)
  const { data: diagnosticos } = await supabase.from('diagnosticos').select('*').eq('estudante_id', user.id).eq('concluido', true)

  const trilhaLP = trilhas?.find((t) => t.disciplina === 'lp')
  const trilhaMat = trilhas?.find((t) => t.disciplina === 'matematica')

  const { data: thLP } = trilhaLP
    ? await supabase.from('trilha_habilidades').select('*, habilidade:habilidades(*)').eq('trilha_id', trilhaLP.id)
    : { data: null }

  const { data: thMat } = trilhaMat
    ? await supabase.from('trilha_habilidades').select('*, habilidade:habilidades(*)').eq('trilha_id', trilhaMat.id)
    : { data: null }

  const { data: insigniasEstudante } = await supabase
    .from('estudante_insignias')
    .select('*, insignia:insignias(*)')
    .eq('estudante_id', user.id)

  const { data: todasInsignias } = await supabase.from('insignias').select('*')

  const xpTotal = (trilhaLP?.xp_acumulado ?? 0) + (trilhaMat?.xp_acumulado ?? 0)
  const xpPossivel = (trilhaLP?.xp_total_possivel ?? 0) + (trilhaMat?.xp_total_possivel ?? 0)
  const trilhasCompletas = [trilhaLP, trilhaMat].filter((t) => t?.concluida).length

  const diagLP = diagnosticos?.find((d) => d.disciplina === 'lp')
  const diagMat = diagnosticos?.find((d) => d.disciplina === 'matematica')

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="w-5 h-5 text-blue-200" />
              <span className="text-blue-200 text-sm font-medium">Relatório de Aprendizagem</span>
            </div>
            <h1 className="text-2xl font-bold">{profile.nome_completo}</h1>
            <p className="text-blue-100 text-sm mt-1">{profile.escola} · CEGLB</p>
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
            <span className="text-xs text-blue-200 font-semibold">
              {xpPossivel > 0 ? Math.round((xpTotal / xpPossivel) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Insígnias', value: `${insigniasEstudante?.length ?? 0}/${todasInsignias?.length ?? 0}`, icon: '🏆' },
          { label: 'Trilhas concluídas', value: `${trilhasCompletas}/2`, icon: '🗺️' },
          { label: 'Nível LP inicial', value: diagLP?.nivel_identificado ? `Nível ${diagLP.nivel_identificado}` : '—', icon: '📖' },
          { label: 'Nível MAT inicial', value: diagMat?.nivel_identificado ? `Nível ${diagMat.nivel_identificado}` : '—', icon: '🔢' },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-xl font-bold text-foreground">{item.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Habilidades por disciplina */}
      {[
        { titulo: 'Língua Portuguesa', trilhaHabilidades: thLP as TrilhaHabilidade[] | null, emoj: '📖' },
        { titulo: 'Matemática', trilhaHabilidades: thMat as TrilhaHabilidade[] | null, emoj: '🔢' },
      ].map(({ titulo, trilhaHabilidades, emoj }) => {
        if (!trilhaHabilidades) return null
        const concluidas = trilhaHabilidades.filter((th) => th.status === 'concluida')
        const emAndamento = trilhaHabilidades.filter((th) => th.status === 'em_andamento')
        const naoIniciadas = trilhaHabilidades.filter((th) => th.status === 'nao_iniciada')

        return (
          <div key={titulo} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <span className="text-xl">{emoj}</span>
              <h2 className="font-bold text-foreground">{titulo}</h2>
              <span className="ml-auto text-sm text-gray-400">
                {concluidas.length}/{trilhaHabilidades.length} concluídas
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {trilhaHabilidades.map((th) => (
                <div key={th.id} className="px-5 py-4 flex items-center gap-3">
                  {th.status === 'concluida' && <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />}
                  {th.status === 'em_andamento' && <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                  {th.status === 'nao_iniciada' && <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      <span className="text-primary font-bold">{th.habilidade?.codigo}</span>
                      {' · '}
                      {th.habilidade?.descricao}
                    </p>
                    <p className="text-xs text-gray-400">{th.habilidade?.eixo} · Nível SAEB {th.habilidade?.nivel_escala_saeb}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {th.status === 'concluida' && (
                      <span className="text-xs font-bold text-success">+{th.xp_conquistado} XP</span>
                    )}
                    {th.status === 'em_andamento' && (
                      <span className="text-xs text-gray-400">{th.tentativas} tentativa{th.tentativas !== 1 ? 's' : ''}</span>
                    )}
                    {th.status === 'nao_iniciada' && (
                      <span className="text-xs text-gray-300">Não iniciada</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sumário */}
            <div className="p-5 bg-gray-50 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-success">{concluidas.length}</div>
                <div className="text-xs text-gray-400">Desenvolvidas</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">{emAndamento.length}</div>
                <div className="text-xs text-gray-400">Em desenvolvimento</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-400">{naoIniciadas.length}</div>
                <div className="text-xs text-gray-400">Não desenvolvidas</div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Insígnias */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
          🏆 Insígnias
          <span className="text-sm font-normal text-gray-400">
            ({insigniasEstudante?.length ?? 0} de {todasInsignias?.length ?? 0})
          </span>
        </h2>
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

      {/* Nota sobre relatório parcial */}
      {(!trilhaLP?.concluida || !trilhaMat?.concluida) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-amber-500 text-lg">⚠️</span>
          <p className="text-sm text-amber-700">
            <strong>Relatório parcial</strong> — Você ainda não concluiu todas as trilhas. Continue praticando para ver seu relatório completo!
          </p>
        </div>
      )}
    </div>
  )
}
