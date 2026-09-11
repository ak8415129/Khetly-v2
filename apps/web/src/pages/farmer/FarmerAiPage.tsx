import { useState, useRef, useEffect } from 'react'
import { Send, Sprout } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@lib/api-client'
import { cn } from '@lib/utils'
import type { AiMessage, AiChatResponse } from '@khetly/types'

const FARMER_SUGGESTIONS = [
  'My wheat leaves are yellowing — what fertilizer should I use?',
  'Which crop gives best returns in Rabi season in Haryana?',
  'How do I improve my listing to attract more renters?',
  'What is the MSP for wheat in 2024–25?',
  'How to do soil health check at home?',
  'Which government schemes can I apply for?',
]

export default function FarmerAiPage() {
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)

  const sendMessage = useMutation({
    mutationFn: (message: string) =>
      apiClient.post<AiChatResponse>('/ai/chat', { message, persona: 'farmer', conversationId }) as Promise<AiChatResponse>,
    onSuccess: (res) => {
      setMessages((m) => [...m, res.message])
      setConversationId(res.conversationId)
    },
  })

  const handleSend = () => {
    const text = input.trim()
    if (!text || sendMessage.isPending) return
    const userMsg: AiMessage = { id: Date.now().toString(), role: 'user', content: text, createdAt: new Date().toISOString() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    sendMessage.mutate(text)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sendMessage.isPending])

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="w-9 h-9 bg-brand-50 rounded-full flex items-center justify-center">
          <Sprout className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-base font-medium text-gray-900">Farming AI Advisor</h1>
          <p className="text-xs text-gray-500">Ask about crops, yield, soil, government schemes</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <Sprout className="w-10 h-10 text-brand-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-5">Ask anything about farming, crops, or your listings</p>
            <div className="flex flex-col gap-2 items-center">
              {FARMER_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-sm text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-full transition-colors max-w-xs text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-1', msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-brand-50')}>
              {msg.role === 'user' ? '👨‍🌾' : '🌿'}
            </div>
            <div className={cn(
              'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
              msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'
            )}>
              {msg.content}
            </div>
          </div>
        ))}

        {sendMessage.isPending && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">🌿</div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-gray-100 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Fasal, mitti, ya sarkari yojana ke baare mein poochhen…"
          className="input-base flex-1"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sendMessage.isPending}
          className="w-12 h-12 bg-brand-600 hover:bg-brand-800 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
