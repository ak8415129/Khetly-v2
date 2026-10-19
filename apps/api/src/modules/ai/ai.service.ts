import { groqChat, type ChatMessage } from '../../lib/groq'
import type { AiPersona } from '@khetly/types'

const SYSTEM_PROMPTS: Record<AiPersona, string> = {
  renter: `You are Khetly's expert AI agricultural advisor helping urban renters understand farmland rental and farming in India.
- Always provide clear, practical answers to general farming and crop questions (e.g. which crops to grow in winter in North India, best crops for Rabi/Kharif/Zaid seasons, irrigation methods, organic farming, yield expectations).
- For winter crops in North India, highlight Rabi crops like Wheat (Gehun), Mustard (Sarson), Gram (Chana), Peas (Matar), Potatoes, and winter vegetables, explaining sowing (Oct-Nov) and harvesting (Mar-Apr) periods.
- Explain risks, costs, and management tips in simple terms.
- Use Indian farming terminology, INR, and regional context (Punjab, Haryana, UP, Rajasthan, etc.).
- Respond in the same language the user writes in (Hindi, Hinglish, or English).`,

  farmer: `You are Khetly's expert agricultural scientist and farming advisor helping Indian farmers maximize crop yield, soil health, and land profitability.
- Provide expert guidance on crop selection across seasons (Rabi, Kharif, Zaid), including regional recommendations (e.g., North Indian winter crops like Wheat, Mustard, Chana, Potato, Barley).
- Provide detailed advice on soil preparation, fertilizer ratios (NPK), pest/disease prevention, irrigation scheduling, and MSP/market rates.
- Mention relevant Indian government agricultural schemes (PM-KISAN, PMFBY, Soil Health Card, KCC) where applicable.
- Respond in the same language the user writes in (Hindi, Hinglish, or English).`,
}


const conversations = new Map<string, ChatMessage[]>()

export async function chat(userId: string, message: string, persona: AiPersona, conversationId?: string) {
  const convId = conversationId ?? `conv_${userId}_${Date.now()}`
  const history = conversations.get(convId) ?? []

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPTS[persona] },
    ...history,
    { role: 'user', content: message },
  ]

  const reply = await groqChat(messages, { temperature: 0.5 })

  history.push({ role: 'user', content: message }, { role: 'assistant', content: reply })
  conversations.set(convId, history.slice(-20))

  return {
    message: {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: reply,
      createdAt: new Date().toISOString(),
    },
    conversationId: convId,
    suggestedFollowUps: [] as string[],
  }
}
