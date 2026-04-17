'use client'
// app/reservas/page.tsx
import { useEffect, useState } from 'react'
import { Filter, Search, Download, Plus } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import AIChat from '@/components/ui/AIChat'
import ReservationCard from '@/components/ui/ReservationCard'
import { cn } from '@/lib/utils'
import type { Reservation, ReservationStatus } from '@/types'

const STATUS_TABS: { value: ReservationStatus | 'all'; label: string }[] = [
  { value: 'all',          label: 'Todas'      },
  { value: 'confirmed',    label: 'Confirmadas' },
  { value: 'pending',      label: 'Pendentes'  },
  { value: 'checking_in',  label: 'Check-in'   },
  { value: 'checking_out', label: 'Check-out'  },
  { value: 'completed',    label: 'Concluídas' },
  { value: 'cancelled',    label: 'Canceladas' },
]

export default function ReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tab, setTab]   = useState<ReservationStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = tab !== 'all' ? `?status=${tab}` : ''
    fetch(`/api/reservas${params}`)
      .then(r => r.json())
      .then(d => setReservations(d.data ?? []))
      .finally(() => setLoading(false))
  }, [tab])

  const filtered = reservations.filter(r =>
    r.guest?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.airbnb_id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />
      <main className="flex-1 ml-56 flex flex-col overflow-hidden">
        <Topbar title="Reservas" subtitle={`${filtered.length} reservas encontradas`} />

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Filters row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-8 py-1.5 text-[12px]"
                placeholder="Buscar hóspede ou código..."
              />
            </div>
            <button className="btn-secondary text-[12px] py-1.5">
              <Filter size={13} /> Filtrar
            </button>
            <button className="btn-secondary text-[12px] py-1.5">
              <Download size={13} /> Exportar
            </button>
            <button className="btn-primary text-[12px] py-1.5 ml-auto">
              <Plus size={13} /> Nova reserva
            </button>
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 flex-wrap">
            {STATUS_TABS.map(t => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={cn(
                  'text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all',
                  tab === t.value
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-neutral-500 border-black/[0.08] hover:bg-neutral-50'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="card">
            {loading ? (
              <div className="space-y-4 py-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-neutral-100 rounded w-1/3" />
                      <div className="h-2.5 bg-neutral-100 rounded w-1/2" />
                    </div>
                    <div className="h-5 w-20 bg-neutral-100 rounded-full" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-[13px] text-neutral-400">
                Nenhuma reserva encontrada
              </div>
            ) : (
              filtered.map((r, i) => (
                <ReservationCard key={r.id} reservation={r} animDelay={i * 40} />
              ))
            )}
          </div>
        </div>
        <AIChat />
      </main>
    </div>
  )
}
