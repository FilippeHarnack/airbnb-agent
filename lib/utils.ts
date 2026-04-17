// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays, isToday, isTomorrow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ReservationStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date, fmt = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: ptBR })
}

export function formatDateShort(date: string): string {
  const d = parseISO(date)
  if (isToday(d)) return 'Hoje'
  if (isTomorrow(d)) return 'Amanhã'
  return format(d, "dd 'de' MMM", { locale: ptBR })
}

export function calcNights(checkIn: string, checkOut: string): number {
  return differenceInDays(parseISO(checkOut), parseISO(checkIn))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
}

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  confirmed:    'Confirmada',
  pending:      'Pendente',
  cancelled:    'Cancelada',
  completed:    'Concluída',
  checking_in:  'Check-in',
  checking_out: 'Check-out',
}

export const STATUS_COLORS: Record<ReservationStatus, string> = {
  confirmed:    'bg-emerald-50 text-emerald-700',
  pending:      'bg-amber-50 text-amber-700',
  cancelled:    'bg-red-50 text-red-700',
  completed:    'bg-slate-100 text-slate-600',
  checking_in:  'bg-blue-50 text-blue-700',
  checking_out: 'bg-orange-50 text-orange-700',
}

export const CATEGORY_LABELS: Record<string, string> = {
  cleaning:    'Limpeza',
  maintenance: 'Manutenção',
  supplies:    'Suprimentos',
  airbnb_fee:  'Taxa Airbnb',
  utilities:   'Utilidades',
  taxes:       'Impostos',
  other:       'Outros',
}

// Validação do webhook secret do n8n
export function validateWebhookSecret(secret: string | null): boolean {
  return secret === process.env.N8N_WEBHOOK_SECRET
}
