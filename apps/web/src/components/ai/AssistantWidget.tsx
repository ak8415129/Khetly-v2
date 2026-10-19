import { useEffect, useRef, useState } from 'react'
import { Sparkles, Send, X } from 'lucide-react'
import { useAssistantChat, type AssistantMessage } from '@modules/ai/assistant.hooks'
import { cn } from '@lib/utils'

const SUGGESTIONS = [
  'Which crops should grow in winter season in North India?',
  'How does renting farmland on Khetly work?',
  'What are the best Rabi season crops?',
  'What does the platform fee cover?',
]


export function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [conversationId, setConversationId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)
  const chat = useAssistantChat()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chat.isPending])

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || chat.isPending) return

    const userMsg: AssistantMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((m) => [...m, userMsg])
    setInput('')

    chat.mutate(
      { message: content, conversationId },
      {
        onSuccess: (res) => {
          setMessages((m) => [...m, res.message])
          setConversationId(res.conversationId)
        },
        onError: () => {
          setMessages((m) => [
            ...m,
            {
              id: `e_${Date.now()}`,
              role: 'assistant',
              content: "Sorry, I couldn't reach the assistant just now. Please try again in a moment.",
              createdAt: new Date().toISOString(),
            },
          ])
        },
      }
    )
  }

  return (
    <>
      {/* ── Floating launcher button ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Khetly AI assistant"
          className="fixed bottom-5 right-5 z-40 group"
        >
          {/* Rotating gradient ring behind the button */}
          <span
            className="absolute -inset-1 rounded-full opacity-80 blur-[2px] animate-spin-slow"
            style={{
              background: 'conic-gradient(from 0deg, #3b6d11, #8fd14f, #eaf3de, #3b6d11)',
            }}
          />
          {/* Soft pulsing glow */}
          <span className="absolute -inset-1 rounded-full bg-brand-400/40 animate-ping" />

          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5 group-hover:scale-105 transition-transform">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #3b6d11, #6ba82f)' }}
            >
              <Sparkles className="h-5 w-5" />
            </span>
          </span>
        </button>
      )}

      {/* ── Chat panel ── */}
      {open && (
        <div className="fixed bottom-5 right-5 z-40 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-slide-up">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b6d11, #6ba82f)' }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium leading-tight">Khetly Assistant</p>
                <p className="text-[11px] text-white/80 leading-tight">Ask about renting, listings, or trust & safety</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-lg p-1 hover:bg-white/15 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="py-2">
                <p className="text-xs text-gray-500 mb-2.5 px-1">Try asking:</p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-left text-xs text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-xl transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 rounded-tl-sm shadow-sm ring-1 ring-black/5'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {chat.isPending && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm ring-1 ring-black/5 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce-dot"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-2.5 flex-shrink-0 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Khetly anything…"
              className="flex-1 h-9 rounded-full border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none focus:border-brand-400 focus:bg-white transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || chat.isPending}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-800 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
