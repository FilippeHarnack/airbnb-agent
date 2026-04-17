// app/api/reservas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const status  = searchParams.get('status')
  const month   = searchParams.get('month')   // "2026-04"
  const limit   = parseInt(searchParams.get('limit') ?? '50')

  let query = supabase
    .from('reservations')
    .select(`
      *,
      guest:guests(*),
      property:properties(*)
    `)
    .order('check_in', { ascending: true })
    .limit(limit)

  if (status) query = query.eq('status', status)
  if (month)  query = query.gte('check_in', `${month}-01`).lte('check_in', `${month}-31`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('reservations')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
