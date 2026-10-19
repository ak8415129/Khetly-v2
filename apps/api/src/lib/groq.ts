import { env } from '../config/env'
import { AppError } from '../middleware/error.middleware'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GroqResponse {
  choices: Array<{ message: { role: string; content: string } }>
}

/**
 * Calls Groq's OpenAI-compatible chat completions endpoint.
 * Free tier, no SDK required — plain fetch against the REST API.
 * Get a key at https://console.groq.com
 */
export async function groqChat(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<string> {
  if (!env.GROQ_API_KEY) {
    throw new AppError(
      'AI assistant is not configured. Add GROQ_API_KEY to apps/api/.env — get a free key at https://console.groq.com',
      503,
      'AI_NOT_CONFIGURED'
    )
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL,
      messages,
      temperature: options?.temperature ?? 0.4,
      max_tokens: options?.maxTokens ?? 1024,
    }),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    console.error('Groq API error:', response.status, errBody)
    throw new AppError('AI service is temporarily unavailable. Please try again.', 503, 'AI_ERROR')
  }

  const data = (await response.json()) as GroqResponse
  return data.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.'
}
