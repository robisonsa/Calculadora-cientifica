import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Clock } from 'lucide-react'

export default async function SequenciasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sequencias } = await supabase
    .from('sequencias_didaticas')
    .select('*, habilidade:habilidades(*)')
    .order('id', { ascending: true })

  const disciplinas = ['lp', 'matematica'] as const
  const disciplinaNomes = { lp: 'Língua Portuguesa', matematica: 'Matemática' }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Biblioteca de Sequências Didáticas</h1>
        <p className="text-gray-500 text-sm mt-1">
          Sequências prontas para trabalhar as habilidades com maior índice de lacuna
        </p>
      </div>

      {!sequencias || sequencias.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma sequência cadastrada. Execute o seed primeiro.</p>
        </div>
      ) : (
        disciplinas.map((disc) => {
          const seqDisc = sequencias.filter((s) => (s as { habilidade?: { disciplina: string } }).habilidade?.disciplina === disc)
          if (seqDisc.length === 0) return null

          return (
            <div key={disc}>
              <h2 className="text-lg font-bold text-foreground mb-4">
                {disc === 'lp' ? '📖' : '🔢'} {disciplinaNomes[disc]}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {seqDisc.map((seq) => (
                  <SequenciaCard key={seq.id} seq={seq as SequenciaComHabilidade} />
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

interface SequenciaComHabilidade {
  id: string
  titulo: string
  objetivo: string
  materiais: string
  etapas: string
  tempo_estimado_minutos: number
  ano_escolar: string
  habilidade?: {
    codigo: string
    descricao: string
    eixo: string
    nivel_escala_saeb: number
    disciplina: string
  }
}

function parseEtapas(raw: string) {
  // Normaliza \n literais e divide em blocos por parágrafo
  const text = raw.replace(/\\n/g, '\n')
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      // Extrai **título** e o resto como descrição
      const m = p.match(/^\*\*(.+?)\*\*\s*(.*)$/s)
      return m ? { titulo: m[1], descricao: m[2].trim() } : { titulo: null, descricao: p }
    })
}

function SequenciaCard({ seq }: { seq: SequenciaComHabilidade }) {
  const etapas = parseEtapas(seq.etapas)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-md">
                {seq.habilidade?.codigo}
              </span>
              <span className="text-xs text-gray-400">Nível SAEB {seq.habilidade?.nivel_escala_saeb}</span>
            </div>
            <h3 className="font-semibold text-foreground text-sm leading-snug">{seq.titulo}</h3>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-3">{seq.objetivo}</p>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {seq.tempo_estimado_minutos} min
          </span>
          <span>{seq.ano_escolar}</span>
          <span>{seq.habilidade?.eixo}</span>
        </div>
      </div>

      <details className="border-t border-gray-100">
        <summary className="px-5 py-3 text-xs font-semibold text-primary hover:bg-green-50 cursor-pointer transition-colors select-none">
          ▶ Ver etapas da sequência
        </summary>
        <div className="px-5 pb-5 pt-1">
          {seq.materiais && (
            <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">📦 Materiais</p>
              <p className="text-sm text-amber-900">{seq.materiais}</p>
            </div>
          )}

          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">📋 Etapas</p>
          <ol className="space-y-3">
            {etapas.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div>
                  {step.titulo && (
                    <p className="text-sm font-bold text-foreground leading-snug">{step.titulo}</p>
                  )}
                  {step.descricao && (
                    <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{step.descricao}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </details>
    </div>
  )
}
