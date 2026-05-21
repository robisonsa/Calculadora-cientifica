import Link from 'next/link'
import type { TrilhaHabilidade } from '@/lib/types/database'
import { CheckCircle2, Circle, Clock, ChevronRight } from 'lucide-react'

interface HabilidadeCardProps {
  trilhaHabilidade: TrilhaHabilidade
  index: number
}

const statusConfig = {
  nao_iniciada: {
    icon: <Circle className="w-5 h-5 text-gray-400" />,
    bg: 'bg-white border-gray-200',
    badge: 'bg-gray-100 text-gray-500',
    badgeText: 'Não iniciada',
  },
  em_andamento: {
    icon: <Clock className="w-5 h-5 text-blue-500" />,
    bg: 'bg-blue-50 border-blue-300',
    badge: 'bg-blue-100 text-blue-700',
    badgeText: 'Em andamento',
  },
  concluida: {
    icon: <CheckCircle2 className="w-5 h-5 text-success" />,
    bg: 'bg-green-50 border-green-300',
    badge: 'bg-green-100 text-green-700',
    badgeText: 'Concluída',
  },
}

const disciplinaNome: Record<string, string> = { lp: 'LP', matematica: 'MAT' }

function xpPorNivel(nivel: number): number {
  if (nivel <= 3) return 100
  if (nivel <= 6) return 150
  return 200
}

export function HabilidadeCard({ trilhaHabilidade, index }: HabilidadeCardProps) {
  const { habilidade, status, xp_conquistado, tentativas, acertos } = trilhaHabilidade
  const config = statusConfig[status]
  const xpPossivel = habilidade ? xpPorNivel(habilidade.nivel_escala_saeb) : 100

  return (
    <div className={`border-2 rounded-2xl p-5 ${config.bg} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-md">
                {habilidade?.codigo ?? 'HAB'}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
                {config.badgeText}
              </span>
              <span className="text-xs text-gray-400">
                Nível SAEB {habilidade?.nivel_escala_saeb}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug">
              {habilidade?.descricao ?? 'Carregando...'}
            </p>
            <p className="text-xs text-gray-400 mt-1">{habilidade?.eixo}</p>

            {status !== 'nao_iniciada' && tentativas > 0 && (
              <p className="text-xs text-gray-500 mt-1.5">
                {tentativas} tentativa{tentativas > 1 ? 's' : ''} · {acertos} acerto{acertos !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className={`text-xs font-bold ${status === 'concluida' ? 'text-success' : 'text-amber-600'}`}>
            {status === 'concluida' ? `+${xp_conquistado} XP` : `${xpPossivel} XP`}
          </div>
          {status !== 'concluida' && (
            <Link
              href={`/estudante/atividade/${trilhaHabilidade.habilidade_id}`}
              className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-green-800 transition-colors font-semibold"
            >
              {status === 'em_andamento' ? 'Continuar' : 'Iniciar'}
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
