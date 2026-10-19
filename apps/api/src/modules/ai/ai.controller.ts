import type { Request, Response, NextFunction } from 'express'
import * as svc from './ai.service'
import * as ragSvc from './rag.service'

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, persona, conversationId } = req.body
    const data = await svc.chat(req.userId, message, persona, conversationId)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

// Public — works for anonymous visitors too, since the widget appears before login
export async function assistant(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, conversationId } = req.body
    const data = await ragSvc.assistantChat(message, conversationId)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}
