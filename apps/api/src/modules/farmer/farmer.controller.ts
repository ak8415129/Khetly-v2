import type { Request, Response, NextFunction } from 'express'
import * as svc from './farmer.service'

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getOrCreateFarmerProfile(req.userId) }) } catch (err) { next(err) }
}
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.updateFarmerProfile(req.userId, req.body) }) } catch (err) { next(err) }
}
export async function getStats(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getFarmerStats(req.userId) }) } catch (err) { next(err) }
}
export async function getBookings(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getFarmerBookings(req.userId) }) } catch (err) { next(err) }
}
export async function updateBookingStatus(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.updateBookingStatus(req.params['bookingId']!, req.userId, req.body.status) }) } catch (err) { next(err) }
}
