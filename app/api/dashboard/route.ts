// app/api/dashboard/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function GET() {
  const supabase = createServerClient()
  const today    = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const monthStr = format(today, 'yyyy-MM')
  const startMonth = format(startOfMonth(today), 'yyyy-MM-dd')
  const endMonth   = format(endOfMonth(today), 'yyyy-MM-dd')
  const prevMonth  = format(subMonths(startOfMonth(today), 1), 'yyyy-MM')

  const [
    { data: monthRevs },
    { data: prevRevs },
    { data: monthExpenses },
    { data: todayCheckins },
    { data: todayCheckouts },
    { data: pendingRes },
    { count: totalMonth },
  ] = await Promise.all([
    supabase.from('reservations').select('host_payout').gte('check_in', startMonth).lte('check_in', endMonth).neq('status', 'cancelled'),
    supabase.from('reservations').select('host_payout').gte('check_in', `${prevMonth}-01`).lte('check_in', `${prevMonth}-31`).neq('status', 'cancelled'),
    supabase.from('expenses').select('amount').gte('date', startMonth).lte('date', endMonth),
    supabase.from('reservations').select('id').eq('check_in', todayStr).neq('status', 'cancelled'),
    supabase.from('reservations').select('id').eq('check_out', todayStr).neq('status', 'cancelled'),
    supabase.from('reservations').select('id').eq('status', 'pending'),
    supabase.from('reservations').select('id', { count: 'exact', head: true }).gte('check_in', startMonth).lte('check_in', endMonth).neq('status', 'cancelled'),
  ])

  // Ocupação: dias ocupados / dias no mês
  const daysInMonth = endOfMonth(today).getDate()
  const { data: occRes } = await supabase
    .from('reservations')
    .select('check_in, check_out, nights')
    .gte('check_in', startMonth)
    .lte('check_out', endMonth)
    .neq('status', 'cancelled')

  const occupiedDays = occRes?.reduce((s, r) => s + (r.nights ?? 0), 0) ?? 0
  const occupancyRate = Math.min(100, Math.round((occupiedDays / daysInMonth) * 100))

  const revenueMonth  = monthRevs?.reduce((s, r) => s + (r.host_payout ?? 0), 0) ?? 0
  const revenuePrev   = prevRevs?.reduce((s, r) => s + (r.host_payout ?? 0), 0) ?? 0
  const expensesMonth = monthExpenses?.reduce((s, e) => s + (e.amount ?? 0), 0) ?? 0

  return NextResponse.json({
    revenue_month:           revenueMonth,
    revenue_prev_month:      revenuePrev,
    net_profit_month:        revenueMonth - expensesMonth,
    occupancy_rate:          occupancyRate,
    total_reservations_month: totalMonth ?? 0,
    checkins_today:          todayCheckins?.length ?? 0,
    checkouts_today:         todayCheckouts?.length ?? 0,
    pending_reservations:    pendingRes?.length ?? 0,
  })
}
