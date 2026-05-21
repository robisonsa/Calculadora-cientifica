interface XPBarProps {
  xp: number
  maxXP: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
}

export function XPBar({ xp, maxXP, showLabel = true, size = 'md', showPercentage = false }: XPBarProps) {
  const pct = maxXP > 0 ? Math.min(Math.round((xp / maxXP) * 100), 100) : 0
  const h = size === 'sm' ? 'h-2.5' : size === 'lg' ? 'h-5' : 'h-3.5'

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-amber-500 flex items-center gap-1">⚡ XP</span>
          <span className="text-xs font-bold text-foreground">
            {xp.toLocaleString('pt-BR')} / {maxXP.toLocaleString('pt-BR')}
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${h} overflow-hidden`}>
        <div
          className={`${h} rounded-full xp-shimmer transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-gray-400 mt-1 text-right font-semibold">{pct}%</p>
      )}
    </div>
  )
}
