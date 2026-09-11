import type { Request, Response, NextFunction } from 'express'
import * as svc from './admin.service'

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getPlatformStats() }) } catch (err) { next(err) }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { role, search, page, pageSize } = req.query
    const data = await svc.listUsers({
      role: role as string, search: search as string,
      page: page ? Number(page) : undefined, pageSize: pageSize ? Number(pageSize) : undefined,
    })
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function suspendUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.suspendUser(req.userId, req.params['userId']!, req.body.reason ?? '')
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function reactivateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.reactivateUser(req.userId, req.params['userId']!)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function pendingFarmers(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.listPendingFarmerVerifications() }) } catch (err) { next(err) }
}

export async function verifyFarmer(req: Request, res: Response, next: NextFunction) {
  try {
    const { approve, reason } = req.body
    const data = await svc.verifyFarmer(req.userId, req.params['farmerId']!, approve, reason)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function pendingListings(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.listPendingListings() }) } catch (err) { next(err) }
}

export async function moderateListing(req: Request, res: Response, next: NextFunction) {
  try {
    const { approve, reason } = req.body
    const data = await svc.moderateListing(req.userId, req.params['listingId']!, approve, reason)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function removeListing(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.removeListing(req.userId, req.params['listingId']!, req.body.reason ?? '')
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function allBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, page, pageSize } = req.query
    const data = await svc.listAllBookings({
      status: status as string, page: page ? Number(page) : undefined, pageSize: pageSize ? Number(pageSize) : undefined,
    })
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function auditLog(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, pageSize } = req.query
    const data = await svc.getAuditLog(page ? Number(page) : undefined, pageSize ? Number(pageSize) : undefined)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}
