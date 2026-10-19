import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { rateLimit } from 'express-rate-limit'
import * as ctrl from './ai.controller'

export const aiRouter = Router()

const aiRateLimit = rateLimit({ windowMs: 60 * 1000, max: 20 })
// Slightly tighter — this endpoint is public (no auth), so it's more exposed to abuse
const assistantRateLimit = rateLimit({ windowMs: 60 * 1000, max: 15 })

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  persona: z.enum(['farmer', 'renter']),
  conversationId: z.string().optional(),
})

const assistantSchema = z.object({
  message: z.string().min(1).max(1000),
  conversationId: z.string().optional(),
})

// Existing persona-based chat — requires login, used on /ai-assistant and /farmer/ai pages
aiRouter.post('/chat', requireAuth, aiRateLimit, validate({ body: chatSchema }), ctrl.chat)

// New global RAG assistant — public, powers the floating widget on every page
aiRouter.post('/assistant', assistantRateLimit, validate({ body: assistantSchema }), ctrl.assistant)
