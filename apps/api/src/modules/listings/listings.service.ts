import prisma from '../../lib/prisma'
import { AppError } from '../../middleware/error.middleware'
import { haversineKm } from '@khetly/utils'
import type { RiskLevel, LandType, HarvestSeason } from '@khetly/types'
import type { LogisticsOption, AddonType } from '@khetly/types'

export interface SearchParams {
  lat?: number; lng?: number; radiusKm?: number
  crop?: string; riskLevel?: RiskLevel; landType?: LandType
  maxPricePerMonth?: number; page?: number; pageSize?: number
  sortBy?: 'distance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
}

type ListingSearchRow = {
  id: string; farmer: { id: string; verificationStatus: string; rating: number; reviewCount: number; user: { name: string; avatarUrl: string | null } }
  lat: number; lng: number; primaryCrop: string; seedVariety: string; harvestSeason: string
  yieldMin: number; yieldMax: number; yieldUnit: string; priceMin: number; priceMax: number
  priceUnit: string; fertilizerPlan: string; pesticidePlan: string; village: string; tehsil: string
  district: string; state: string; pincode: string; pricePerMonth: number
}

type ListingSearchResult = { pricePerMonth: number; distanceKm?: number }

export async function searchListings(params: SearchParams) {
  const { lat, lng, radiusKm, crop, riskLevel, landType, maxPricePerMonth, page = 1, pageSize = 12, sortBy = 'distance' } = params
  const where: Record<string, unknown> = {
    status: 'ACTIVE', // only approved + live listings are searchable
    ...(crop && {
      OR: [
        { primaryCrop: { contains: crop, mode: 'insensitive' } },
        { title: { contains: crop, mode: 'insensitive' } },
        { village: { contains: crop, mode: 'insensitive' } },
        { tehsil: { contains: crop, mode: 'insensitive' } },
        { district: { contains: crop, mode: 'insensitive' } },
        { state: { contains: crop, mode: 'insensitive' } },
      ],
    }),
    ...(riskLevel && { riskLevel }),
    ...(landType && { landType }),
    ...(maxPricePerMonth && { pricePerMonth: { lte: maxPricePerMonth } }),
  }
  const rows = await prisma.landListing.findMany({
    where,
    include: { farmer: { select: { id: true, verificationStatus: true, rating: true, reviewCount: true, user: { select: { name: true, avatarUrl: true } } } } },
  })
  let results: ListingSearchResult[] = rows.map((r: ListingSearchRow) => ({
    ...r,
    farmer: { id: r.farmer.id, name: r.farmer.user.name, avatarUrl: r.farmer.user.avatarUrl ?? undefined, verificationStatus: r.farmer.verificationStatus, rating: r.farmer.rating, reviewCount: r.farmer.reviewCount },
    address: { village: r.village, tehsil: r.tehsil, district: r.district, state: r.state, pincode: r.pincode, geoPoint: { lat: r.lat, lng: r.lng } },
    cropDetails: { primaryCrop: r.primaryCrop, seedVariety: r.seedVariety, harvestSeason: r.harvestSeason, yieldMin: r.yieldMin, yieldMax: r.yieldMax, yieldUnit: r.yieldUnit, estimatedPriceMin: r.priceMin, estimatedPriceMax: r.priceMax, priceUnit: r.priceUnit, fertilizerPlan: r.fertilizerPlan, pesticidePlan: r.pesticidePlan },
    distanceKm: lat && lng && (r.lat !== 0 || r.lng !== 0) ? haversineKm(lat, lng, r.lat, r.lng) : undefined,
  }))
  if (lat && lng && radiusKm) {
    results = results.filter((r) => r.distanceKm === undefined || r.distanceKm <= radiusKm)
  }
  if (sortBy === 'distance' && lat && lng) {
    results.sort((a: ListingSearchResult, b: ListingSearchResult) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999))
  }
  if (sortBy === 'price_asc') results.sort((a: ListingSearchResult, b: ListingSearchResult) => a.pricePerMonth - b.pricePerMonth)
  if (sortBy === 'price_desc') results.sort((a: ListingSearchResult, b: ListingSearchResult) => b.pricePerMonth - a.pricePerMonth)
  const start = (page - 1) * pageSize
  const paginated = results.slice(start, start + pageSize)
  return { data: paginated, total: results.length, page, pageSize, totalPages: Math.ceil(results.length / pageSize), hasMore: start + pageSize < results.length }
}

export async function getListingById(id: string) {
  const r = await prisma.landListing.findUnique({ where: { id }, include: { farmer: { select: { id: true, verificationStatus: true, rating: true, reviewCount: true, user: { select: { name: true, avatarUrl: true } } } } } })
  if (!r) throw new AppError('Listing not found', 404, 'NOT_FOUND')
  await prisma.landListing.update({ where: { id }, data: { viewCount: { increment: 1 } } })
  return {
    ...r,
    farmer: { id: r.farmer.id, name: r.farmer.user.name, avatarUrl: r.farmer.user.avatarUrl ?? undefined, verificationStatus: r.farmer.verificationStatus, rating: r.farmer.rating, reviewCount: r.farmer.reviewCount },
    address: { village: r.village, tehsil: r.tehsil, district: r.district, state: r.state, pincode: r.pincode, geoPoint: { lat: r.lat, lng: r.lng } },
    cropDetails: { primaryCrop: r.primaryCrop, seedVariety: r.seedVariety, harvestSeason: r.harvestSeason, yieldMin: r.yieldMin, yieldMax: r.yieldMax, yieldUnit: r.yieldUnit, estimatedPriceMin: r.priceMin, estimatedPriceMax: r.priceMax, priceUnit: r.priceUnit, fertilizerPlan: r.fertilizerPlan, pesticidePlan: r.pesticidePlan },
  }
}

export async function createListing(farmerId: string, data: Record<string, unknown>) {
  const { address, cropDetails, ...rest } = data as { address: Record<string, unknown>; cropDetails: Record<string, unknown>; [key: string]: unknown }
  return prisma.landListing.create({
    data: {
      farmerId,
      village: address['village'] as string, tehsil: address['tehsil'] as string,
      district: address['district'] as string, state: address['state'] as string, pincode: address['pincode'] as string,
      lat: (address['geoPoint'] as Record<string, number>)?.lat ?? 0, lng: (address['geoPoint'] as Record<string, number>)?.lng ?? 0,
      primaryCrop: cropDetails['primaryCrop'] as string, seedVariety: cropDetails['seedVariety'] as string,
      harvestSeason: cropDetails['harvestSeason'] as HarvestSeason, yieldMin: cropDetails['yieldMin'] as number, yieldMax: cropDetails['yieldMax'] as number,
      yieldUnit: (cropDetails['yieldUnit'] as string) ?? 'quintal/acre',
      priceMin: cropDetails['estimatedPriceMin'] as number, priceMax: cropDetails['estimatedPriceMax'] as number,
      priceUnit: (cropDetails['priceUnit'] as string) ?? 'per quintal',
      fertilizerPlan: (cropDetails['fertilizerPlan'] as string) ?? '', pesticidePlan: (cropDetails['pesticidePlan'] as string) ?? '',
      title: rest['title'] as string, description: (rest['description'] as string) ?? '',
      landType: rest['landType'] as LandType, plotSizeAcres: rest['plotSizeAcres'] as number,
      riskLevel: (rest['riskLevel'] as RiskLevel) ?? 'LOW', riskDescription: (rest['riskDescription'] as string) ?? '',
      logistics: (rest['logistics'] as LogisticsOption[]) ?? [], addons: (rest['addons'] as AddonType[]) ?? [],
      pricePerMonth: rest['pricePerMonth'] as number, minRentalMonths: (rest['minRentalMonths'] as number) ?? 1,
      // Goes to PENDING_REVIEW — admin must approve before it's searchable
      status: 'PENDING_REVIEW',
    },
  })
}

export async function updateListing(id: string, farmerId: string, data: Record<string, unknown>) {
  const existing = await prisma.landListing.findUnique({ where: { id } })
  if (!existing) throw new AppError('Listing not found', 404, 'NOT_FOUND')
  if (existing.farmerId !== farmerId) throw new AppError('Forbidden', 403, 'FORBIDDEN')
  // Editing an active listing sends it back for re-review
  const needsReReview = existing.status === 'ACTIVE'
  return prisma.landListing.update({
    where: { id },
    data: { ...data, ...(needsReReview && { status: 'PENDING_REVIEW' }) },
  })
}

export async function deleteListing(id: string, farmerId: string) {
  const existing = await prisma.landListing.findUnique({ where: { id } })
  if (!existing) throw new AppError('Listing not found', 404, 'NOT_FOUND')
  if (existing.farmerId !== farmerId) throw new AppError('Forbidden', 403, 'FORBIDDEN')
  await prisma.landListing.update({ where: { id }, data: { status: 'ARCHIVED' } })
}

export async function getFarmerListings(farmerId: string) {
  return prisma.landListing.findMany({ where: { farmerId }, orderBy: { createdAt: 'desc' } })
}
