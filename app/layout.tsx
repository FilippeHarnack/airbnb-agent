// app/layout.tsx
import type { Metadata } from 'next'
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HostAgent — Gestão Airbnb',
  description: 'Agente IA para gestão inteligente de imóveis no Airbnb',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-neutral-50 text-neutral-900 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              borderRadius: '8px',
              border: '0.5px solid rgba(0,0,0,0.1)',
            },
          }}
        />
      </body>
    </html>
  )
}
