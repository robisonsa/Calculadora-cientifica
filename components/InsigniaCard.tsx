import type { Insignia } from '@/lib/types/database'

interface InsigniaCardProps {
  insignia: Insignia
  conquistada?: boolean
  dataConquista?: string
}

export function InsigniaCard({ insignia, conquistada = false, dataConquista }: InsigniaCardProps) {
  return (
    <div
      title={conquistada ? insignia.descricao : `Bloqueada: ${insignia.criterio}`}
      className={`
        flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-default
        ${conquistada
          ? 'border-amber-300 bg-gradient-to-b from-amber-50 to-yellow-50 shadow-md hover:shadow-lg hover:-translate-y-0.5'
          : 'border-gray-200 bg-gray-50 opacity-45 grayscale'}
      `}
    >
      <span className={`text-3xl leading-none ${conquistada ? 'bounce-in' : ''}`}>
        {conquistada ? insignia.icone_emoji : '🔒'}
      </span>
      <span className="text-xs font-bold text-center text-foreground leading-tight">{insignia.nome}</span>
      {conquistada && dataConquista && (
        <span className="text-[10px] text-amber-600 font-semibold">
          {new Date(dataConquista).toLocaleDateString('pt-BR')}
        </span>
      )}
    </div>
  )
}
