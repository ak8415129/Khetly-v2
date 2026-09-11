import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { rateLimit } from 'express-rate-limit'
import * as ctrl from './ai.controller'

export const aiRouter = Router()

const aiRateLimit = rateLimit({ windowMs: 60 * 1000, max: 20 })

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  persona: z.enum(['farmer', 'renter']),
  conversationId: z.string().optional(),
})

aiRouter.post('/chat', requireAuth, aiRateLimit, validate({ body: chatSchema }), ctrl.chat)
