import type { Request, Response, NextFunction } from 'express'
import * as svc from './ai.service'

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, persona, conversationId } = req.body
    const data = await svc.chat(req.userId, message, persona, conversationId)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}
