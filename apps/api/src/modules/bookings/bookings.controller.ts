import type { Request, Response, NextFunction } from 'express'
import * as svc from './bookings.service'

export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await svc.createBooking(req.userId, req.body) }) } catch (err) { next(err) }
}
export async function mine(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getRenterBookings(req.userId) }) } catch (err) { next(err) }
}
export async function cancel(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.cancelBooking(req.params['id']!, req.userId) }) } catch (err) { next(err) }
}
