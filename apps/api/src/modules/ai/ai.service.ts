import { env } from '../../config/env'
import { AppError } from '../../middleware/error.middleware'
import type { AiPersona } from '@khetly/types'

const SYSTEM_PROMPTS: Record<AiPersona, string> = {
  renter: `You are Khetly's AI assistant helping urban renters understand farmland rental in India. Help users choose crops, understand risks, and make informed rental decisions. Be concise, friendly, use Indian farming context (INR, Indian crops, seasons). Respond in the same language the user writes in (Hindi or English).`,
  farmer: `You are Khetly's AI farming advisor helping Indian farmers optimize yield and listings. Provide advice on crop selection, soil health, fertilizer, pest management, irrigation, pricing. Use Indian farming terminology, Rabi/Kharif/Zaid seasons. Mention government schemes when relevant. Respond in the same language the user writes in (Hindi or English).`,
}

const conversations = new Map<string, Array<{ role: 'user' | 'assistant'; content: string }>>()

export async function chat(userId: string, message: string, persona: AiPersona, conversationId?: string) {
  if (!env.ANTHROPIC_API_KEY) {
    return {
      message: { id: Date.now().toString(), role: 'assistant' as const, content: `[AI not configured] You asked: "${message}". Add ANTHROPIC_API_KEY to apps/api/.env to enable AI.`, createdAt: new Date().toISOString() },
      conversationId: conversationId ?? `conv_${userId}_${Date.now()}`,
      suggestedFollowUps: [],
    }
  }
  const convId = conversationId ?? `conv_${userId}_${Date.now()}`
  const history = conversations.get(convId) ?? []
  history.push({ role: 'user', content: message })
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, system: SYSTEM_PROMPTS[persona], messages: history }),
  })
  if (!response.ok) throw new AppError('AI service unavailable', 503, 'AI_ERROR')
  const data = await response.json() as { content: Array<{ type: string; text: string }> }
  const text = data.content.find(b => b.type === 'text')?.text ?? 'Sorry, I could not generate a response.'
  history.push({ role: 'assistant', content: text })
  conversations.set(convId, history.slice(-20))
  return { message: { id: Date.now().toString(), role: 'assistant' as const, content: text, createdAt: new Date().toISOString() }, conversationId: convId, suggestedFollowUps: [] }
}
