// app/api/webhook/n8n/route.ts
// Recebe payload do n8n (que captura eventos do Airbnb) e salva no Supabase
// O n8n deve enviar o header: x-webhook-secret: <N8N_WEBHOOK_SECRET>

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { analyzeNewReservation } from '@/lib/ai-agent'
import { validateWebhookSecret } from '@/lib/utils'
import type { AirbnbWebhookPayload } from '@/types'

export async function POST(req: NextRequest) {
  // 1. Validar segredo
  const secret = req.headers.get('x-webhook-secret')
  if (!validateWebhookSecret(secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: AirbnbWebhookPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { event_type, reservation } = body

  // ── 2. Buscar ou criar propriedade ──────────────────────────
  let { data: property } = await supabase
    .from('properties')
    .select('id')
    .eq('airbnb_listing_id', reservation.listing_id)
    .single()

  if (!property) {
    const { data: newProp } = await supabase
      .from('properties')
      .insert({
        name: `Imóvel ${reservation.listing_id}`,
        address: 'Endereço não informado',
        airbnb_listing_id: reservation.listing_id,
        base_price_per_night: 0,
      })
      .select('id')
      .single()
    property = newProp
  }

  // ── 3. Buscar ou criar hóspede ──────────────────────────────
  let { data: guest } = await supabase
    .from('guests')
    .select('id, total_stays, total_nights')
    .eq('name', reservation.guest.name)
    .single()

  if (!guest) {
    const { data: newGuest } = await supabase
      .from('guests')
      .insert({
        name: reservation.guest.name,
        email: reservation.guest.email,
        photo_url: reservation.guest.photo,
        is_verified: true,
        total_stays: 0,
        total_nights: 0,
      })
      .select('id, total_stays, total_nights')
      .single()
    guest = newGuest
  }

  // ── 4. Processar evento ─────────────────────────────────────
  if (event_type === 'reservation.created') {
    const nights =
      Math.round(
        (new Date(reservation.check_out).getTime() -
          new Date(reservation.check_in).getTime()) /
          86400000
      )

    // Inserir reserva
    const { data: newReservation, error } = await supabase
      .from('reservations')
      .insert({
        airbnb_id:      reservation.confirmation_code,
        guest_id:       guest?.id,
        property_id:    property?.id,
        check_in:       reservation.check_in,
        check_out:      reservation.check_out,
        nights,
        guests_count:   reservation.guests,
        total_amount:   reservation.pricing.total,
        host_payout:    reservation.pricing.host_payout,
        airbnb_fee:     reservation.pricing.airbnb_fee,
        cleaning_fee:   reservation.pricing.cleaning_fee,
        status:         'confirmed',
      })
      .select()
      .single()

    if (error) {
      console.error('[webhook] Erro ao inserir reserva:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Inserir despesa automática da taxa Airbnb
    await supabase.from('expenses').insert({
      property_id:    property?.id,
      reservation_id: newReservation.id,
      category:       'airbnb_fee',
      description:    `Taxa Airbnb — Reserva ${reservation.confirmation_code}`,
      amount:         reservation.pricing.airbnb_fee,
      date:           reservation.check_in,
    })

    // Atualizar contador do hóspede
    if (guest) {
      await supabase
        .from('guests')
        .update({
          total_stays:  (guest.total_stays ?? 0) + 1,
          total_nights: (guest.total_nights ?? 0) + nights,
        })
        .eq('id', guest.id)
    }

    // ── 5. Analisar com IA ────────────────────────────────────
    const aiInsight = await analyzeNewReservation({
      check_in:      reservation.check_in,
      check_out:     reservation.check_out,
      nights,
      guests_count:  reservation.guests,
      total_amount:  reservation.pricing.total,
      host_payout:   reservation.pricing.host_payout,
      airbnb_fee:    reservation.pricing.airbnb_fee,
    })

    return NextResponse.json({
      success: true,
      event: 'reservation.created',
      reservation_id: newReservation.id,
      ai_insight: aiInsight,
    })
  }

  if (event_type === 'reservation.cancelled') {
    await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('airbnb_id', reservation.confirmation_code)

    return NextResponse.json({ success: true, event: 'reservation.cancelled' })
  }

  if (event_type === 'reservation.updated') {
    await supabase
      .from('reservations')
      .update({ status: reservation.status as string })
      .eq('airbnb_id', reservation.confirmation_code)

    return NextResponse.json({ success: true, event: 'reservation.updated' })
  }

  return NextResponse.json({ success: true, event: event_type })
}
