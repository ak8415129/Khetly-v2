import type { Request, Response, NextFunction } from 'express'
import * as svc from './user.service'

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.updateMe(req.userId, req.body) }) } catch (err) { next(err) }
}
export async function getMyStats(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getMyStats(req.userId) }) } catch (err) { next(err) }
}
export async function getMyBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query['limit'] ? Number(req.query['limit']) : undefined
    res.json({ success: true, data: await svc.getMyBookings(req.userId, limit) })
  } catch (err) { next(err) }
}
