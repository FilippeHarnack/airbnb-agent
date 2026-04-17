// ─────────────────────────────────────────────────
// types/index.ts  —  shared types for the whole app
// ─────────────────────────────────────────────────

export type ReservationStatus =
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'
  | 'checking_in'
  | 'checking_out'

export interface Reservation {
  id: string
  airbnb_id: string          // ID original do Airbnb
  guest_id: string
  guest?: Guest
  property_id: string
  property?: Property
  check_in: string           // ISO date
  check_out: string          // ISO date
  nights: number
  guests_count: number
  total_amount: number       // valor total cobrado pelo Airbnb
  host_payout: number        // valor repassado ao anfitrião
  airbnb_fee: number         // taxa Airbnb
  cleaning_fee: number
  status: ReservationStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface Guest {
  id: string
  airbnb_guest_id?: string
  name: string
  email?: string
  phone?: string
  photo_url?: string
  total_stays: number
  total_nights: number
  avg_rating?: number
  is_verified: boolean
  created_at: string
}

export interface Property {
  id: string
  name: string
  address: string
  airbnb_listing_id?: string
  photo_url?: string
  base_price_per_night: number
  created_at: string
}

export type ExpenseCategory =
  | 'cleaning'
  | 'maintenance'
  | 'supplies'
  | 'airbnb_fee'
  | 'utilities'
  | 'taxes'
  | 'other'

export interface Expense {
  id: string
  property_id: string
  reservation_id?: string
  category: ExpenseCategory
  description: string
  amount: number
  date: string
  created_at: string
}

export interface DashboardMetrics {
  revenue_month: number
  revenue_prev_month: number
  net_profit_month: number
  occupancy_rate: number
  avg_rating: number
  total_reservations_month: number
  checkins_today: number
  checkouts_today: number
  pending_reservations: number
}

export interface MonthlyRevenue {
  month: string   // "2026-01"
  revenue: number
  expenses: number
  profit: number
  occupancy: number
}

export interface SeasonData {
  month: string   // "Jan", "Fev" ...
  occupancy: number
  tier: 'high' | 'mid' | 'low'
}

// ── Webhook payload vindo do n8n ─────────────────
export interface AirbnbWebhookPayload {
  event_type: 'reservation.created' | 'reservation.updated' | 'reservation.cancelled'
  reservation: {
    confirmation_code: string
    status: string
    check_in: string
    check_out: string
    nights: number
    guests: number
    guest: {
      name: string
      email?: string
      photo?: string
    }
    pricing: {
      total: number
      host_payout: number
      airbnb_fee: number
      cleaning_fee: number
    }
    listing_id: string
  }
  received_at: string
}

// ── Resposta do agente IA ────────────────────────
export interface AIAnalysis {
  insight: string
  recommendations: string[]
  low_season_months: string[]
  suggested_price_adjustments: { month: string; change_pct: number }[]
}
