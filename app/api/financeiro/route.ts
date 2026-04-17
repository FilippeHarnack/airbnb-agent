// app/api/financeiro/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') ?? format(new Date(), 'yyyy-MM')

  const startDate = `${month}-01`
  const endDate   = format(endOfMonth(new Date(startDate)), 'yyyy-MM-dd')

  // Receita do mês
  const { data: revenues } = await supabase
    .from('reservations')
    .select('host_payout, total_amount, airbnb_fee, cleaning_fee')
    .gte('check_in', startDate)
    .lte('check_in', endDate)
    .neq('status', 'cancelled')

  const revenueMonth = revenues?.reduce((s, r) => s + (r.host_payout ?? 0), 0) ?? 0

  // Despesas do mês
  const { data: expensesData } = await supabase
    .from('expenses')
    .select('amount, category')
    .gte('date', startDate)
    .lte('date', endDate)

  const expensesMonth = expensesData?.reduce((s, e) => s + (e.amount ?? 0), 0) ?? 0

  // Despesas por categoria
  const byCategory: Record<string, number> = {}
  expensesData?.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount
  })

  // Mês anterior para comparação
  const prevMonthStr = format(subMonths(startOfMonth(new Date(startDate)), 1), 'yyyy-MM')
  const { data: prevRevenues } = await supabase
    .from('reservations')
    .select('host_payout')
    .gte('check_in', `${prevMonthStr}-01`)
    .lte('check_in', `${prevMonthStr}-31`)
    .neq('status', 'cancelled')

  const revenuePrevMonth = prevRevenues?.reduce((s, r) => s + (r.host_payout ?? 0), 0) ?? 0

  // Histórico mensal (últimos 12 meses)
  const { data: monthlyView } = await supabase
    .from('monthly_revenue')
    .select('*')
    .order('month', { ascending: true })
    .limit(12)

  return NextResponse.json({
    revenue_month:      revenueMonth,
    revenue_prev_month: revenuePrevMonth,
    expenses_month:     expensesMonth,
    net_profit:         revenueMonth - expensesMonth,
    expenses_by_category: byCategory,
    monthly_history:    monthlyView ?? [],
  })
}
