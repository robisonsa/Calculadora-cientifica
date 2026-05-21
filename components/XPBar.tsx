interface XPBarProps {
  xp: number
  maxXP: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function XPBar({ xp, maxXP, showLabel = true, size = 'md' }: XPBarProps) {
  const percentage = maxXP > 0 ? Math.min((xp / maxXP) * 100, 100) : 0
  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-3'

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold text-amber-600">⚡ XP</span>
          <span className="text-xs font-bold text-foreground">
            {xp.toLocaleString('pt-BR')} / {maxXP.toLocaleString('pt-BR')}
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${heightClass} overflow-hidden`}>
        <div
          className={`${heightClass} rounded-full bg-gradient-to-r from-accent to-yellow-400 transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-400 mt-1 text-right">{percentage.toFixed(0)}% da trilha</p>
      )}
    </div>
  )
}
