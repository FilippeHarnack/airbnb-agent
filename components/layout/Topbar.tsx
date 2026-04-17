'use client'
// components/layout/Topbar.tsx
import { useState } from 'react'
import { Bell, Search, Plus, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface TopbarProps {
  title: string
  subtitle?: string
  checkinCount?: number
  onNewReservation?: () => void
}

export default function Topbar({ title, subtitle, checkinCount = 0, onNewReservation }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const today = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })

  return (
    <header className="h-14 bg-white border-b border-black/[0.06] flex items-center px-6 gap-4 sticky top-0 z-20">
      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-display font-semibold text-[15px] text-neutral-800 leading-none truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-neutral-400 mt-0.5 capitalize">{subtitle ?? today}</p>
        )}
      </div>

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search size={13} className="absolute left-3 text-neutral-400 pointer-events-none" />
        <input
          className="w-48 text-[12px] bg-neutral-50 border border-black/[0.07] rounded-lg pl-8 pr-3 py-1.5
                     focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 focus:bg-white
                     placeholder:text-neutral-400 transition-all"
          placeholder="Buscar hóspede, reserva..."
        />
      </div>

      {/* Check-in badge */}
      {checkinCount > 0 && (
        <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[11px] font-medium px-3 py-1.5 rounded-full border border-blue-100">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          {checkinCount} check-in{checkinCount > 1 ? 's' : ''} hoje
        </div>
      )}

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand rounded-full" />
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-10 w-72 bg-white border border-black/[0.08] rounded-xl shadow-lg p-3 z-50 animate-fade-up">
            <p className="text-[12px] font-semibold text-neutral-700 mb-3 px-1">Notificações</p>
            {[
              { msg: 'Nova reserva recebida via n8n', time: 'agora', dot: 'bg-brand' },
              { msg: 'Check-in de Carlos Lima em 2h', time: '10min', dot: 'bg-blue-400' },
              { msg: 'Análise IA concluída', time: '1h', dot: 'bg-emerald-400' },
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-2.5 px-1 py-2 rounded-lg hover:bg-neutral-50 cursor-pointer">
                <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', n.dot)} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-neutral-700 leading-snug">{n.msg}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New reservation button */}
      <button onClick={onNewReservation} className="btn-primary text-[12px] py-1.5 px-3">
        <Plus size={13} />
        <span className="hidden sm:inline">Nova reserva</span>
      </button>
    </header>
  )
}
