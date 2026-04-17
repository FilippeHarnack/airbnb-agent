'use client'
// app/dashboard/page.tsx
import { useEffect, useState } from 'react'
import {
  DollarSign, TrendingUp, Home, CalendarCheck,
  Sparkles, ArrowRight, Users, Clock,
} from 'lucide-react'
import Topbar        from '@/components/layout/Topbar'
import MetricCard    from '@/components/ui/MetricCard'
import ReservationCard from '@/components/ui/ReservationCard'
import RevenueChart  from '@/components/charts/RevenueChart'
import AIChat        from '@/components/ui/AIChat'
import { formatCurrency, pctChange } from '@/lib/utils'
import type { Reservation, MonthlyRevenue } from '@/types'
import Link from 'next/link'

export default function DashboardPage() {
  const [metrics, setMetrics]       = useState<any>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [monthly, setMonthly]       = useState<MonthlyRevenue[]>([])
  const [aiInsight, setAiInsight]   = useState<string>('')
  const [loadingAI, setLoadingAI]   = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/reservas?limit=5').then(r => r.json()),
      fetch('/api/financeiro').then(r => r.json()),
    ]).then(([dash, res, fin]) => {
      setMetrics(dash)
      setReservations(res.data ?? [])
      setMonthly(fin.monthly_history ?? [])
    })
  }, [])

  useEffect(() => {
    if (!monthly.length) return
    setLoadingAI(true)
    fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'monthly_analysis' }),
    })
      .then(r => r.json())
      .then(d => setAiInsight(d.analysis?.insight ?? ''))
      .finally(() => setLoadingAI(false))
  }, [monthly])

  const revDelta = metrics
    ? pctChange(metrics.revenue_month, metrics.revenue_prev_month)
    : 0

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        checkinCount={metrics?.checkins_today}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* AI Insight Banner */}
        <div className="card border-l-[3px] border-l-brand flex items-start gap-3 animate-fade-up">
          <div className="w-7 h-7 bg-brand/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={14} className="text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-brand uppercase tracking-wider mb-1">
              Agente IA — análise do mês
            </p>
            {loadingAI ? (
              <div className="h-4 bg-neutral-100 rounded animate-pulse w-3/4" />
            ) : (
              <p className="text-[13px] text-neutral-600 leading-relaxed">
                {aiInsight || 'Carregando análise inteligente das suas reservas...'}
              </p>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Receita do mês"
            value={metrics ? formatCurrency(metrics.revenue_month) : '—'}
            delta={revDelta}
            icon={DollarSign}
            animDelay={0}
          />
          <MetricCard
            label="Lucro líquido"
            value={metrics ? formatCurrency(metrics.net_profit_month) : '—'}
            icon={TrendingUp}
            animDelay={100}
          />
          <MetricCard
            label="Ocupação"
            value={metrics ? `${metrics.occupancy_rate}%` : '—'}
            icon={Home}
            iconColor="text-blue-500"
            animDelay={200}
          />
          <MetricCard
            label="Reservas"
            value={metrics ? String(metrics.total_reservations_month) : '—'}
            icon={CalendarCheck}
            iconColor="text-emerald-500"
            animDelay={300}
          />
        </div>

        {/* Status row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Check-ins hoje',  value: metrics?.checkins_today ?? 0,       color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-100' },
            { label: 'Check-outs hoje', value: metrics?.checkouts_today ?? 0,      color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-100' },
            { label: 'Pendentes',       value: metrics?.pending_reservations ?? 0, color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-100' },
          ].map((s, i) => (
            <div key={s.label} className={`card flex items-center gap-3 opacity-0 animate-fade-up delay-${(i+4)*100}`}
              style={{ animationFillMode: 'forwards' }}>
              <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center`}>
                <span className={`font-display font-bold text-lg ${s.color}`}>{s.value}</span>
              </div>
              <span className="text-[12px] text-neutral-500">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Chart + Recent reservations */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Revenue chart */}
          <div className="card lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-[14px] text-neutral-800">Receita mensal</h3>
              <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-brand rounded-sm" />Receita</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-200 rounded-sm" />Despesas</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-sm" />Lucro</span>
              </div>
            </div>
            <RevenueChart data={monthly} />
          </div>

          {/* Recent reservations */}
          <div className="card lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-[14px] text-neutral-800">Próximas reservas</h3>
              <Link href="/reservas" className="text-[11px] text-brand flex items-center gap-1 hover:underline">
                Ver todas <ArrowRight size={10} />
              </Link>
            </div>
            <div className="flex-1">
              {reservations.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[12px] text-neutral-400">
                  Nenhuma reserva encontrada
                </div>
              ) : (
                reservations.slice(0, 4).map((r, i) => (
                  <ReservationCard key={r.id} reservation={r} compact animDelay={i * 60} />
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      <AIChat />
    </div>
  )
}
