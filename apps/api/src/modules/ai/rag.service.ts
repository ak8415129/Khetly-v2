import prisma from '../../lib/prisma'
import { embedText, toVectorLiteral } from '../../lib/embeddings'
import { groqChat, type ChatMessage } from '../../lib/groq'
import { KNOWLEDGE_BASE } from './knowledge-base'

interface RetrievedChunk {
  id: string
  title: string
  content: string
  category: string
  similarity: number
}

const ASSISTANT_SYSTEM_PROMPT = `You are Khetly's AI assistant and Indian agriculture expert. Khetly connects urban farmland renters with verified farmers across India.

You assist users with two main types of inquiries:
1. **Farming & Agricultural Advice**:
   - When users ask about crops, seasonal farming (Rabi, Kharif, Zaid), winter/summer crops, soil suitability, fertilizers, irrigation, pest management, or regional agronomy (such as North Indian winter crops, Punjab/Haryana/UP farming, or high-yield crop varieties), answer thoroughly, practically, and helpfully based on Indian farming practices.
   - For example, if asked "which crop should grow in winter season in north india", clearly explain the major Rabi crops (Wheat/Gehun, Mustard/Sarson, Chickpea/Chana, Peas/Matar, Potato, Winter Vegetables like cauliflower, cabbage, spinach, carrots), their sowing (Oct-Nov) and harvesting (Mar-Apr) windows, soil needs, and advantages.
   - When relevant, mention how renters can find farmland for these crops on Khetly.

2. **Khetly Platform Questions**:
   - For questions about Khetly's rental process, fees (8% platform fee), farmer verification, listing moderation, booking flow, disputes, or reviews, prioritize and align strictly with the Khetly Context provided below. Do not fabricate fee numbers or platform policies.

Tone & Style:
- Be helpful, clear, and structured (use bullet points where appropriate).
- Use INR for currency and standard Indian agricultural terms (Rabi, Kharif, quintal, bigha/acre where helpful).
- Respond in the language used by the user (English, Hindi, or Hinglish).`


// In-memory per-conversation history — fine for a single-instance deploy (Render free tier).
// If you scale to multiple instances, move this to Redis or the database.
const conversations = new Map<string, ChatMessage[]>()

/** Retrieves the top-K most relevant knowledge base chunks for a query using pgvector or in-memory fallback. */
async function retrieveRelevantChunks(query: string, topK = 4): Promise<RetrievedChunk[]> {
  try {
    const queryVector = await embedText(query)
    const literal = toVectorLiteral(queryVector)

    // 1 - cosine_distance = cosine_similarity. pgvector's <=> operator is cosine distance.
    const rows = await prisma.$queryRawUnsafe<RetrievedChunk[]>(
      `
      SELECT "id", "title", "content", "category",
             1 - ("embedding" <=> $1::vector) AS similarity
      FROM "knowledge_chunks"
      ORDER BY "embedding" <=> $1::vector
      LIMIT $2
      `,
      literal,
      topK
    )

    if (rows && rows.length > 0) {
      return rows
    }
  } catch {
    // If pgvector extension or knowledge_chunks table is not present, use the curated KNOWLEDGE_BASE fallback
  }

  // Resilient fallback: Lexical / keyword scoring against KNOWLEDGE_BASE
  const qLower = query.toLowerCase()
  const qWords = qLower.split(/\s+/).filter((w) => w.length > 2)

  return KNOWLEDGE_BASE.map((item) => {
    const text = `${item.title} ${item.content}`.toLowerCase()
    let score = 0
    for (const word of qWords) {
      if (text.includes(word)) score += 1
    }
    const similarity = qWords.length > 0 ? score / qWords.length : 0.5
    return {
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      similarity: similarity > 0 ? Math.min(similarity + 0.35, 1) : 0.2,
    }
  })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
}

export async function assistantChat(message: string, conversationId?: string) {
  const convId = conversationId ?? `assistant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const chunks = await retrieveRelevantChunks(message)

  // Only use chunks that are reasonably relevant — avoids feeding unrelated context
  // when a user asks something totally outside the knowledge base (e.g. "what's the weather").
  const relevant = chunks.filter((c) => c.similarity > 0.3)

  const context = relevant.length > 0
    ? relevant.map((c) => `[${c.title}]\n${c.content}`).join('\n\n')
    : 'No specific context found for this question.'

  const history = conversations.get(convId) ?? []

  const messages: ChatMessage[] = [
    { role: 'system', content: `${ASSISTANT_SYSTEM_PROMPT}\n\nContext:\n${context}` },
    ...history,
    { role: 'user', content: message },
  ]

  const reply = await groqChat(messages, { temperature: 0.3 })

  history.push({ role: 'user', content: message }, { role: 'assistant', content: reply })
  conversations.set(convId, history.slice(-16)) // keep last 8 exchanges

  return {
    message: {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: reply,
      createdAt: new Date().toISOString(),
    },
    conversationId: convId,
    sources: relevant.map((c) => ({ title: c.title, category: c.category })),
  }
}
