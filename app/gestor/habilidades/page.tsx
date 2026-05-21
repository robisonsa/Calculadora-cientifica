import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function GestorHabilidadesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: habilidades } = await supabase
    .from('habilidades')
    .select('*')
    .order('nivel_escala_saeb', { ascending: true })

  const { data: trilhaHabilidades } = await supabase
    .from('trilha_habilidades')
    .select('habilidade_id, status')

  function getLacuna(habId: string): number {
    const ths = trilhaHabilidades?.filter((th) => th.habilidade_id === habId) ?? []
    if (ths.length === 0) return 0
    const naoConc = ths.filter((th) => th.status !== 'concluida').length
    return Math.round((naoConc / ths.length) * 100)
  }

  function getLacunaColor(pct: number): string {
    if (pct >= 70) return 'bg-red-400'
    if (pct >= 50) return 'bg-orange-400'
    if (pct >= 30) return 'bg-yellow-400'
    return 'bg-green-400'
  }

  const disciplinas = ['lp', 'matematica'] as const
  const disciplinaNomes = { lp: 'Língua Portuguesa', matematica: 'Matemática' }
  const disciplinaEmoji = { lp: '📖', matematica: '🔢' }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mapa de Habilidades</h1>
        <p className="text-gray-500 text-sm mt-1">Percentual de estudantes com lacuna em cada habilidade</p>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 bg-white rounded-2xl border border-gray-200 p-4">
        <span className="text-sm font-semibold text-gray-500">Índice de lacuna:</span>
        {[
          { label: 'Baixo (0–29%)', color: 'bg-green-400' },
          { label: 'Médio (30–49%)', color: 'bg-yellow-400' },
          { label: 'Alto (50–69%)', color: 'bg-orange-400' },
          { label: 'Crítico (70%+)', color: 'bg-red-400' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      {disciplinas.map((disc) => {
        const habsDisc = habilidades?.filter((h) => h.disciplina === disc) ?? []
        if (habsDisc.length === 0) return null

        const eixos = [...new Set(habsDisc.map((h) => h.eixo))]

        return (
          <div key={disc} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-foreground text-lg">
                {disciplinaEmoji[disc]} {disciplinaNomes[disc]}
              </h2>
            </div>

            <div className="p-5 space-y-6">
              {eixos.map((eixo) => {
                const habsEixo = habsDisc.filter((h) => h.eixo === eixo)
                return (
                  <div key={eixo}>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{eixo}</h3>
                    <div className="space-y-3">
                      {habsEixo.map((hab) => {
                        const lacuna = getLacuna(hab.id)
                        const color = getLacunaColor(lacuna)
                        return (
                          <div key={hab.id} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded w-14 text-center flex-shrink-0">
                              {hab.codigo}
                            </span>
                            <p className="flex-1 text-sm text-foreground min-w-0 truncate">{hab.descricao}</p>
                            <span className="text-xs text-gray-400 flex-shrink-0">Nível {hab.nivel_escala_saeb}</span>
                            <div className="w-28 bg-gray-200 rounded-full h-3 flex-shrink-0">
                              <div
                                className={`h-3 rounded-full transition-all ${color}`}
                                style={{ width: `${lacuna}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold w-10 text-right flex-shrink-0 ${
                              lacuna >= 70 ? 'text-red-500' : lacuna >= 50 ? 'text-orange-500' : lacuna >= 30 ? 'text-yellow-600' : 'text-success'
                            }`}>
                              {lacuna}%
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {(!habilidades || habilidades.length === 0) && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-400">Nenhuma habilidade cadastrada. Execute o seed primeiro.</p>
        </div>
      )}
    </div>
  )
}
