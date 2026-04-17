'use client'
// components/charts/RevenueChart.tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, ComposedChart, Area,
} from 'recharts'
import type { MonthlyRevenue } from '@/types'

interface RevenueChartProps {
  data: MonthlyRevenue[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-black/[0.08] rounded-xl p-3 shadow-lg text-[12px]">
      <p className="font-semibold text-neutral-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-neutral-600">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <span className="font-medium">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function RevenueChart({ data }: RevenueChartProps) {
  const formatted = data.map(d => ({
    ...d,
    month: MONTHS[parseInt(d.month.split('-')[1]) - 1] ?? d.month,
    revenue:  Math.round(d.revenue),
    expenses: Math.round(d.expenses ?? 0),
    profit:   Math.round(d.profit ?? 0),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={formatted} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#999' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#999' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,90,95,0.04)' }} />
        <Bar dataKey="revenue"  name="Receita"  fill="#FF5A5F" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="expenses" name="Despesas" fill="#FCA5A5" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Line dataKey="profit" name="Lucro" stroke="#22c55e" strokeWidth={2} dot={false} type="monotone" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
