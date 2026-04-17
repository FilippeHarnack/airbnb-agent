// components/ui/ReservationCard.tsx
import { MapPin, Moon, Users } from 'lucide-react'
import { cn, formatCurrency, formatDate, getInitials, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import type { Reservation } from '@/types'


interface ReservationCardProps {
  reservation: Reservation
  compact?: boolean
  animDelay?: number
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-purple-100 text-purple-700',
  'bg-rose-100 text-rose-700',
]

function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export default function ReservationCard({ reservation, compact = false, animDelay = 0 }: ReservationCardProps) {
  const { guest, status, check_in, check_out, nights, guests_count, host_payout } = reservation
  const name = guest?.name ?? 'Hóspede'

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-3 border-b border-black/[0.05] last:border-0',
        'opacity-0 animate-fade-up'
      )}
      style={{ animationDelay: `${animDelay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Avatar */}
      <div className={cn(
        'shrink-0 rounded-full flex items-center justify-center font-semibold',
        compact ? 'w-8 h-8 text-[11px]' : 'w-10 h-10 text-[13px]',
        avatarColor(name)
      )}>
        {guest?.photo_url
          ? <img src={guest.photo_url} alt={name} className="w-full h-full rounded-full object-cover" />
          : getInitials(name)
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-neutral-800 truncate">{name}</p>
          {guest?.is_verified && (
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">✓</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
          <span>{formatDate(check_in, 'dd/MM')} → {formatDate(check_out, 'dd/MM')}</span>
          <span className="w-px h-3 bg-neutral-200" />
          <span className="flex items-center gap-0.5"><Moon size={9} />{nights}n</span>
          {!compact && (
            <>
              <span className="w-px h-3 bg-neutral-200" />
              <span className="flex items-center gap-0.5"><Users size={9} />{guests_count}</span>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        <span className={cn('badge', STATUS_COLORS[status])}>
          {STATUS_LABELS[status]}
        </span>
        {!compact && (
          <span className="text-[12px] font-semibold text-neutral-700">
            {formatCurrency(host_payout)}
          </span>
        )}
      </div>
    </div>
  )
}
