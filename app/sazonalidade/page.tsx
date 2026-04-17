'use client'
// app/sazonalidade/page.tsx
import { useEffect, useState } from 'react'
import { Sparkles, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react'
import Sidebar   from '@/components/layout/Sidebar'
import Topbar    from '@/components/layout/Topbar'
import AIChat    from '@/components/ui/AIChat'
import { cn }   from '@/lib/utils'
import type { AIAnalysis, SeasonData } from '@/types'

const DEFAULT_SEASON: SeasonData[] = [
  { month: 'Jan', occupancy: 92, tier: 'high' },
  { month: 'Fev', occupancy: 95, tier: 'high' },
  { month: 'Mar', occupancy: 58, tier: 'mid'  },
  { month: 'Abr', occupancy: 78, tier: 'mid'  },
  { month: 'Mai', occupancy: 65, tier: 'mid'  },
  { month: 'Jun', occupancy: 35, tier: 'low'  },
  { month: 'Jul', occupancy: 32, tier: 'low'  },
  { month: 'Ago', occupancy: 48, tier: 'mid'  },
  { month: 'Set', occupancy: 72, tier: 'mid'  },
  { month: 'Out', occupancy: 85, tier: 'high' },
  { month: 'Nov', occupancy: 70, tier: 'mid'  },
  { month: 'Dez', occupancy: 91, tier: 'high' },
]

const TIER_COLORS = {
  high: { bar: 'bg-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Alta' },
  mid:  { bar: 'bg-amber-400',   text: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100',   label: 'Média' },
  low:  { bar: 'bg-red-400',     text: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100',     label: 'Baixa' },
}

export default function SazonalidadePage() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading]   = useState(false)

  function loadAnalysis() {
    setLoading(true)
    fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'monthly_analysis' }),
    })
      .then(r => r.json())
      .then(d => setAnalysis(d.analysis ?? null))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAnalysis() }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />
      <main className="flex-1 ml-56 flex flex-col overflow-hidden">
        <Topbar title="Sazonalidade" subtitle="Análise de demanda e previsões com IA" />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* AI Analysis card */}
          <div className="card border-l-[3px] border-l-brand">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-brand/10 rounded-lg flex items-center justify-center">
                  <Sparkles size={14} className="text-brand" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-neutral-800">Análise do Agente IA</p>
                  <p className="text-[11px] text-neutral-400">Powered by Claude Sonnet</p>
                </div>
              </div>
              <button
                onClick={loadAnalysis}
                disabled={loading}
                className="btn-secondary text-[11px] py-1"
              >
                <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                Atualizar
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-3 bg-neutral-100 rounded animate-pulse" style={{ width: `${80 - i * 15}%` }} />
                ))}
              </div>
            ) : analysis ? (
              <>
                <p className="text-[13px] text-neutral-600 leading-relaxed mb-4">{analysis.insight}</p>

                {analysis.recommendations?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                      Recomendações
                    </p>
                    <ul className="space-y-1.5">
                      {analysis.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-neutral-600">
                          <span className="w-4 h-4 bg-brand/10 text-brand rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.suggested_price_adjustments?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                      Ajustes de preço sugeridos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.suggested_price_adjustments.map((a) => (
                        <div key={a.month} className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px]',
                          a.change_pct >= 0
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : 'bg-red-50 border-red-100 text-red-700'
                        )}>
                          {a.change_pct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          <span className="font-medium">{a.month}</span>
                          <span>{a.change_pct > 0 ? '+' : ''}{a.change_pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[13px] text-neutral-400">Clique em "Atualizar" para gerar análise.</p>
            )}
          </div>

          {/* Occupancy bars */}
          <div className="card">
            <h3 className="font-display font-semibold text-[14px] text-neutral-800 mb-5">
              Demanda histórica por mês
            </h3>
            <div className="space-y-3">
              {DEFAULT_SEASON.map((s, i) => {
                const colors = TIER_COLORS[s.tier]
                return (
                  <div
                    key={s.month}
                    className="flex items-center gap-3 opacity-0 animate-fade-up"
                    style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}
                  >
                    <span className="text-[12px] text-neutral-500 w-8 text-right shrink-0">{s.month}</span>
                    <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700', colors.bar)}
                        style={{ width: `${s.occupancy}%`, transitionDelay: `${i * 40}ms` }}
                      />
                    </div>
                    <span className={cn('text-[11px] font-semibold w-8 shrink-0', colors.text)}>
                      {s.occupancy}%
                    </span>
                    <span className={cn('badge text-[10px] w-14 justify-center', colors.bg, colors.border, colors.text)}>
                      {colors.label}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-4 mt-5 pt-4 border-t border-black/[0.05]">
              {Object.entries(TIER_COLORS).map(([tier, c]) => (
                <div key={tier} className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <span className={cn('w-2.5 h-2.5 rounded-full', c.bar)} />
                  {c.label} temporada
                </div>
              ))}
            </div>
          </div>

          {/* Season cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h4 className="text-[13px] font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-500" /> Alta temporada
              </h4>
              <div className="space-y-2">
                {['🔥 Janeiro — Verão / Réveillon', '🔥 Fevereiro — Carnaval', '🔥 Outubro — Feriados prolongados', '🔥 Dezembro — Natal e férias'].map(s => (
                  <p key={s} className="text-[13px] text-neutral-600">{s}</p>
                ))}
              </div>
            </div>
            <div className="card">
              <h4 className="text-[13px] font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                <TrendingDown size={14} className="text-red-400" /> Baixa temporada
              </h4>
              <div className="space-y-2">
                {['❄️ Junho — Baixíssima demanda', '❄️ Julho — Inverno fraco', '⚠️ Agosto — Demanda moderada', '⚠️ Março — Pós-carnaval'].map(s => (
                  <p key={s} className="text-[13px] text-neutral-600">{s}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
        <AIChat />
      </main>
    </div>
  )
}
