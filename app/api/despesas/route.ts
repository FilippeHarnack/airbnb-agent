// app/api/despesas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')

  let query = supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })

  if (month) {
    query = query
      .gte('date', `${month}-01`)
      .lte('date', `${month}-31`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('expenses')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
