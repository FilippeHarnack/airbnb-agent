// components/ui/MetricCard.tsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  delta?: number        // percentual de mudança
  deltaLabel?: string
  icon?: LucideIcon
  iconColor?: string
  className?: string
  animDelay?: number
}

export default function MetricCard({
  label, value, delta, deltaLabel, icon: Icon, iconColor = 'text-brand', className, animDelay = 0
}: MetricCardProps) {
  const isUp   = delta !== undefined && delta > 0
  const isDown = delta !== undefined && delta < 0

  return (
    <div
      className={cn(
        'metric-card opacity-0 animate-fade-up',
        className
      )}
      style={{ animationDelay: `${animDelay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={cn('w-7 h-7 rounded-lg bg-current/8 flex items-center justify-center', iconColor)}>
            <Icon size={14} className={iconColor} />
          </div>
        )}
      </div>

      <p className="font-display font-semibold text-2xl text-neutral-800 dark:text-neutral-200 leading-none mb-2">
        {value}
      </p>

      {delta !== undefined && (
        <div className={cn(
          'flex items-center gap-1 text-[11px] font-medium',
          isUp ? 'text-emerald-600' : isDown ? 'text-red-500' : 'text-neutral-400'
        )}>
          {isUp   && <TrendingUp size={11} />}
          {isDown && <TrendingDown size={11} />}
          {!isUp && !isDown && <Minus size={11} />}
          <span>
            {isUp ? '+' : ''}{delta}% {deltaLabel ?? 'vs. mês anterior'}
          </span>
        </div>
      )}
    </div>
  )
}
