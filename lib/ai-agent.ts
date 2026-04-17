// lib/ai-agent.ts
// Agente IA usando Anthropic Claude para análise de reservas e previsões

import Anthropic from '@anthropic-ai/sdk'
import type { AIAnalysis, MonthlyRevenue, Reservation } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Prompt base do agente ─────────────────────────────────────
const SYSTEM_PROMPT = `Você é um agente especializado em gestão de imóveis no Airbnb para anfitriões brasileiros.
Analise os dados fornecidos e retorne um JSON válido com a seguinte estrutura exata:
{
  "insight": "string — análise principal em 1-2 frases",
  "recommendations": ["array de 3-5 recomendações práticas em português"],
  "low_season_months": ["array de meses com baixa demanda, ex: 'Junho', 'Julho'"],
  "suggested_price_adjustments": [
    { "month": "Nome do mês", "change_pct": número_inteiro_positivo_ou_negativo }
  ]
}
Responda APENAS com o JSON. Sem markdown, sem explicações adicionais.`

// ── Análise mensal completa ───────────────────────────────────
export async function analyzeMonthlyPerformance(
  monthlyData: MonthlyRevenue[],
  currentMonth: string
): Promise<AIAnalysis> {
  const prompt = `
Dados de receita mensal do imóvel:
${JSON.stringify(monthlyData, null, 2)}

Mês atual: ${currentMonth}

Analise esses dados e forneça insights, recomendações e ajustes de preço sugeridos por mês.
Identifique padrões sazonais típicos do Brasil (carnaval, férias de julho, festas de fim de ano).
`
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  try {
    return JSON.parse(text) as AIAnalysis
  } catch {
    return {
      insight: 'Análise em processamento.',
      recommendations: ['Aguarde a análise ser concluída.'],
      low_season_months: [],
      suggested_price_adjustments: [],
    }
  }
}

// ── Análise de nova reserva (chamado pelo webhook do n8n) ─────
export async function analyzeNewReservation(reservation: Partial<Reservation>): Promise<string> {
  const prompt = `
Nova reserva recebida:
- Check-in: ${reservation.check_in}
- Check-out: ${reservation.check_out}
- Noites: ${reservation.nights}
- Hóspedes: ${reservation.guests_count}
- Valor total: R$ ${reservation.total_amount}
- Repasse ao anfitrião: R$ ${reservation.host_payout}
- Taxa Airbnb: R$ ${reservation.airbnb_fee}

Retorne um JSON: { "insight": "análise em 1 frase sobre esta reserva e dicas para o anfitrião" }
`
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const parsed = JSON.parse(text)
    return parsed.insight ?? 'Reserva recebida com sucesso.'
  } catch {
    return 'Nova reserva processada.'
  }
}

// ── Chat livre com o agente ───────────────────────────────────
export async function chatWithAgent(
  userMessage: string,
  context: { reservations: Reservation[]; metrics: Record<string, unknown> }
): Promise<string> {
  const contextStr = `
Contexto atual do imóvel:
- Total de reservas ativas: ${context.reservations.length}
- Métricas: ${JSON.stringify(context.metrics, null, 2)}
`
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: `Você é um assistente de gestão de imóveis Airbnb. Responda em português de forma direta e prática.
${contextStr}`,
    messages: [{ role: 'user', content: userMessage }],
  })

  return response.content[0].type === 'text'
    ? response.content[0].text
    : 'Não foi possível processar sua pergunta.'
}
