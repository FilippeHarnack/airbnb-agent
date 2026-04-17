'use client'
// components/charts/ExpensesChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CATEGORY_LABELS } from '@/lib/utils'

const COLORS = ['#FF5A5F', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6b7280']

interface ExpensesChartProps {
  data: Record<string, number>
}

export default function ExpensesChart({ data }: ExpensesChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: CATEGORY_LABELS[key] ?? key,
    value: Math.round(value),
  }))

  if (!chartData.length) {
    return (
      <div className="h-48 flex items-center justify-center text-[12px] text-neutral-400">
        Sem despesas registradas
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="40%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) =>
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
          }
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.1)' }}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ fontSize: 11, color: '#666' }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
