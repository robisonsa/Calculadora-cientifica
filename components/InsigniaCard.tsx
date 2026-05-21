import type { EstudanteInsignia, Insignia } from '@/lib/types/database'

interface InsigniaCardProps {
  insignia: Insignia
  conquistada?: boolean
  dataConquista?: string
}

export function InsigniaCard({ insignia, conquistada = false, dataConquista }: InsigniaCardProps) {
  return (
    <div
      className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
        conquistada
          ? 'border-accent bg-amber-50 shadow-md'
          : 'border-gray-200 bg-gray-50 opacity-50 grayscale'
      }`}
    >
      <span className="text-3xl mb-2">{insignia.icone_emoji}</span>
      <span className="text-xs font-bold text-center text-foreground leading-tight">{insignia.nome}</span>
      {conquistada && dataConquista && (
        <span className="text-xs text-gray-400 mt-1">
          {new Date(dataConquista).toLocaleDateString('pt-BR')}
        </span>
      )}
      {!conquistada && (
        <span className="text-xs text-gray-400 mt-1 text-center">{insignia.criterio}</span>
      )}
    </div>
  )
}
