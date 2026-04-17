// app/api/ai/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { chatWithAgent, analyzeMonthlyPerformance } from '@/lib/ai-agent'
import { format } from 'date-fns'

export async function POST(req: NextRequest) {
  const { message, type } = await req.json()
  const supabase = createServerClient()

  // Buscar contexto atual
  const { data: reservations } = await supabase
    .from('reservations')
    .select('*')
    .gte('check_in', format(new Date(), 'yyyy-MM') + '-01')
    .neq('status', 'cancelled')

  const { data: monthlyData } = await supabase
    .from('monthly_revenue')
    .select('*')
    .order('month', { ascending: true })
    .limit(12)

  // Análise mensal completa
  if (type === 'monthly_analysis') {
    const analysis = await analyzeMonthlyPerformance(
      monthlyData ?? [],
      format(new Date(), 'MMMM yyyy')
    )
    return NextResponse.json({ analysis })
  }

  // Chat livre
  const metrics = {
    total_reservations: reservations?.length ?? 0,
    monthly_data: monthlyData?.slice(-3),
  }

  const reply = await chatWithAgent(message, {
    reservations: reservations ?? [],
    metrics,
  })

  return NextResponse.json({ reply })
}
