'use client'
// app/financeiro/page.tsx
import { useEffect, useState } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react'
import Sidebar      from '@/components/layout/Sidebar'
import Topbar       from '@/components/layout/Topbar'
import MetricCard   from '@/components/ui/MetricCard'
import ExpensesChart from '@/components/charts/ExpensesChart'
import RevenueChart  from '@/components/charts/RevenueChart'
import AIChat        from '@/components/ui/AIChat'
import { formatCurrency, pctChange, CATEGORY_LABELS } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function FinanceiroPage() {
  const [data, setData]     = useState<any>(null)
  const [month, setMonth]   = useState(format(new Date(), 'yyyy-MM'))
  const [showAddExp, setShowAddExp] = useState(false)

  useEffect(() => {
    fetch(`/api/financeiro?month=${month}`)
      .then(r => r.json())
      .then(setData)
  }, [month])

  const revDelta = data
    ? pctChange(data.revenue_month, data.revenue_prev_month)
    : 0

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />
      <main className="flex-1 ml-56 flex flex-col overflow-hidden">
        <Topbar title="Financeiro" subtitle="Receitas, despesas e lucros" />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Month picker */}
          <div className="flex items-center gap-3">
            <label className="text-[12px] text-neutral-500 font-medium">Mês:</label>
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="input w-40 text-[12px] py-1.5"
            />
            <button
              onClick={() => setShowAddExp(!showAddExp)}
              className="btn-primary text-[12px] py-1.5 ml-auto"
            >
              <Plus size={13} /> Lançar despesa
            </button>
          </div>

          {/* Add expense form */}
          {showAddExp && (
            <AddExpenseForm month={month} onSaved={() => { setShowAddExp(false); }} />
          )}

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Receita bruta"  value={data ? formatCurrency(data.revenue_month)  : '—'} delta={revDelta} icon={DollarSign}   animDelay={0}   />
            <MetricCard label="Despesas"        value={data ? formatCurrency(data.expenses_month) : '—'} icon={CreditCard}  iconColor="text-red-400" animDelay={100} />
            <MetricCard label="Lucro líquido"   value={data ? formatCurrency(data.net_profit)     : '—'} icon={TrendingUp}  iconColor="text-emerald-500" animDelay={200} />
            <MetricCard
              label="Margem"
              value={data && data.revenue_month > 0
                ? `${Math.round((data.net_profit / data.revenue_month) * 100)}%`
                : '—'}
              icon={TrendingDown}
              iconColor="text-blue-500"
              animDelay={300}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-display font-semibold text-[14px] text-neutral-800 mb-4">
                Histórico mensal
              </h3>
              <RevenueChart data={data?.monthly_history ?? []} />
            </div>
            <div className="card">
              <h3 className="font-display font-semibold text-[14px] text-neutral-800 mb-4">
                Despesas por categoria
              </h3>
              <ExpensesChart data={data?.expenses_by_category ?? {}} />
            </div>
          </div>

          {/* Expenses by category table */}
          {data?.expenses_by_category && (
            <div className="card">
              <h3 className="font-display font-semibold text-[14px] text-neutral-800 mb-4">
                Detalhamento de despesas
              </h3>
              <div className="space-y-3">
                {Object.entries(data.expenses_by_category as Record<string, number>).map(([cat, val]) => {
                  const pct = data.expenses_month > 0 ? Math.round((val / data.expenses_month) * 100) : 0
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-[12px] text-neutral-600 w-28 shrink-0">
                        {CATEGORY_LABELS[cat] ?? cat}
                      </span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[12px] font-medium text-neutral-700 w-24 text-right shrink-0">
                        {formatCurrency(val)}
                      </span>
                      <span className="text-[11px] text-neutral-400 w-8 text-right shrink-0">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <AIChat />
      </main>
    </div>
  )
}

// ── Add Expense inline form ─────────────────────────────────────
function AddExpenseForm({ month, onSaved }: { month: string; onSaved: () => void }) {
  const [form, setForm] = useState({
    category: 'cleaning', description: '', amount: '', date: `${month}-01`,
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.description || !form.amount) return
    setSaving(true)
    await fetch('/api/despesas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })
    setSaving(false)
    onSaved()
  }

  return (
    <div className="card border-brand/20 bg-brand/[0.02] animate-fade-up">
      <h4 className="text-[13px] font-semibold text-neutral-700 mb-3">Nova despesa</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-[11px] text-neutral-500 mb-1 block">Categoria</label>
          <select className="input text-[12px] py-1.5" value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-[11px] text-neutral-500 mb-1 block">Descrição</label>
          <input className="input text-[12px] py-1.5" placeholder="Ex: Limpeza pós-hóspede"
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label className="text-[11px] text-neutral-500 mb-1 block">Valor (R$)</label>
          <input type="number" className="input text-[12px] py-1.5" placeholder="0,00"
            value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <input type="date" className="input text-[12px] py-1.5 w-40"
          value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <button onClick={save} disabled={saving} className="btn-primary text-[12px] py-1.5">
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}
