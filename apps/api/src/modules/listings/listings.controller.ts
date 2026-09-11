import type { Request, Response, NextFunction } from 'express'
import * as svc from './listings.service'
import prisma from '../../lib/prisma'

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const params = {
      ...req.query,
      lat: req.query['lat'] ? Number(req.query['lat']) : undefined,
      lng: req.query['lng'] ? Number(req.query['lng']) : undefined,
      radiusKm: req.query['radiusKm'] ? Number(req.query['radiusKm']) : undefined,
      maxPricePerMonth: req.query['maxPricePerMonth'] ? Number(req.query['maxPricePerMonth']) : undefined,
      page: req.query['page'] ? Number(req.query['page']) : 1,
      pageSize: req.query['pageSize'] ? Number(req.query['pageSize']) : 12,
    }
    const data = await svc.searchListings(params)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.getListingById(req.params['id']!)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId: req.userId } })
    if (!farmer) throw new Error('Farmer profile not found. Complete onboarding first.')
    const data = await svc.createListing(farmer.id, req.body)
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId: req.userId } })
    if (!farmer) throw new Error('Farmer profile not found.')
    const data = await svc.updateListing(req.params['id']!, farmer.id, req.body)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId: req.userId } })
    if (!farmer) throw new Error('Farmer profile not found.')
    await svc.deleteListing(req.params['id']!, farmer.id)
    res.json({ success: true, data: null, message: 'Listing archived' })
  } catch (err) { next(err) }
}

export async function myListings(req: Request, res: Response, next: NextFunction) {
  try {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId: req.userId } })
    if (!farmer) return res.json({ success: true, data: [] })
    const data = await svc.getFarmerListings(farmer.id)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}
