'use client'
// components/ui/AIChat.tsx
import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Loader2, X, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  time: string
}

const SUGGESTIONS = [
  'Qual é minha taxa de ocupação?',
  'Quais meses tenho baixa demanda?',
  'Resumo financeiro do mês',
  'Próximos check-ins',
]

export default function AIChat({ className }: { className?: string }) {
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou seu agente de gestão Airbnb. Posso analisar reservas, lucros, hóspedes e prever sazonalidade. Como posso ajudar?',
      time: 'agora',
    },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const msg = text ?? input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: msg, time: 'agora' }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, type: 'chat' }),
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply ?? 'Não entendi. Tente de novo.', time: 'agora' },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Erro ao conectar com o agente. Verifique sua chave de API.', time: 'agora' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-brand text-white rounded-full shadow-lg
                     flex items-center justify-center hover:bg-brand-dark transition-all duration-200
                     hover:scale-105 active:scale-95"
        >
          <Sparkles size={18} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className={cn(
          'fixed bottom-6 right-6 z-50 w-80 bg-white border border-black/[0.08] rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden animate-fade-up',
          className
        )}>
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-brand text-white">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles size={13} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold leading-none">Agente IA</p>
              <p className="text-[10px] text-white/70 mt-0.5">Powered by Claude</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse-dot" />
              <button onClick={() => setOpen(false)} className="ml-1 p-1 hover:bg-white/20 rounded-md transition-colors">
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[260px] max-h-[340px]">
            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                {m.role === 'assistant' && (
                  <div className="w-5 h-5 bg-brand/10 rounded-md flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <Sparkles size={9} className="text-brand" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[75%] text-[12px] leading-relaxed rounded-xl px-3 py-2',
                  m.role === 'user'
                    ? 'bg-brand text-white rounded-br-sm'
                    : 'bg-neutral-100 text-neutral-700 rounded-bl-sm'
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-brand/10 rounded-md flex items-center justify-center">
                  <Sparkles size={9} className="text-brand" />
                </div>
                <div className="bg-neutral-100 rounded-xl rounded-bl-sm px-3 py-2">
                  <Loader2 size={12} className="text-neutral-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[10px] text-brand bg-brand/8 border border-brand/15 rounded-full px-2.5 py-1
                             hover:bg-brand/15 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-black/[0.06] flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Pergunte sobre suas reservas..."
              className="flex-1 text-[12px] bg-neutral-50 border border-black/[0.07] rounded-lg px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30
                         placeholder:text-neutral-400"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 bg-brand text-white rounded-lg flex items-center justify-center
                         hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
