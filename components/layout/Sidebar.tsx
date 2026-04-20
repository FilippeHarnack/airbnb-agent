'use client'
// components/layout/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, Users, Wallet,
  Calendar, TrendingUp, Settings, Sparkles, Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/reservas',      label: 'Reservas',     icon: CalendarDays },
  { href: '/hospedes',      label: 'Hóspedes',     icon: Users },
  { href: '/financeiro',    label: 'Financeiro',   icon: Wallet },
  { href: '/calendario',    label: 'Calendário',   icon: Calendar },
  { href: '/sazonalidade',  label: 'Sazonalidade', icon: TrendingUp },
  { href: '/beams',         label: 'Beams',        icon: Sparkles },
  { href: '/etheral',       label: 'Etheral',      icon: Sparkles },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 h-screen flex flex-col bg-white dark:bg-neutral-900 border-r border-black/[0.06] dark:border-white/[0.06] fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-black/[0.06] dark:border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
            <Home size={14} className="text-white" />
          </div>
          <span className="font-display font-semibold text-[15px] text-brand tracking-tight">
            HostAgent
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-lg text-[13px] transition-all duration-150',
                active
                  ? 'bg-brand/8 text-brand font-medium'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200'
              )}
            >
              <Icon size={15} className={cn(active ? 'text-brand' : 'text-neutral-400 dark:text-neutral-500')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* AI Badge */}
      <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="bg-gradient-to-br from-brand/5 to-brand/10 border border-brand/15 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-brand rounded-md flex items-center justify-center">
              <Sparkles size={10} className="text-white" />
            </div>
            <span className="text-[11px] font-semibold text-brand">Agente IA ativo</span>
            <span className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-dot" />
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Analisando reservas e gerando insights em tempo real.
          </p>
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-2 px-2 py-2 mt-1 text-[12px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <Settings size={13} />
          Configurações
        </Link>
      </div>
    </aside>
  )
}
