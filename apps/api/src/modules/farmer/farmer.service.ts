import prisma from '../../lib/prisma'
import { AppError } from '../../middleware/error.middleware'

type FarmerStatsBooking = { farmerReceives: number; status: string }
type FarmerBooking = {
  listing: { id: string; title: string; village: string; district: string; photos: string[]; pricePerMonth: number }
}
type FarmerListing = {
  village: string; tehsil: string; district: string; state: string; pincode: string
  lat: number; lng: number; primaryCrop: string; seedVariety: string; harvestSeason: string
  yieldMin: number; yieldMax: number; yieldUnit: string; priceMin: number; priceMax: number
  priceUnit: string; fertilizerPlan: string; pesticidePlan: string
}

export async function getOrCreateFarmerProfile(userId: string) {
  let profile = await prisma.farmerProfile.findUnique({ where: { userId }, include: { user: { select: { name: true, phone: true, avatarUrl: true } } } })
  if (!profile) profile = await prisma.farmerProfile.create({ data: { userId }, include: { user: { select: { name: true, phone: true, avatarUrl: true } } } })
  return profile
}

export async function updateFarmerProfile(userId: string, data: Record<string, unknown>) {
  const profile = await prisma.farmerProfile.findUnique({ where: { userId } })
  if (!profile) throw new AppError('Farmer profile not found', 404, 'NOT_FOUND')

  if (data['name']) {
    await prisma.user.update({
      where: { id: userId },
      data: { name: String(data['name']) },
    })
  }

  // Whitelist only valid Prisma FarmerProfile fields
  const updateData: Record<string, unknown> = {}

  if (data['bio'] !== undefined) updateData['bio'] = String(data['bio'])
  if (data['village'] !== undefined) updateData['village'] = String(data['village'])
  if (data['tehsil'] !== undefined) updateData['tehsil'] = String(data['tehsil'])
  if (data['district'] !== undefined) updateData['district'] = String(data['district'])
  if (data['state'] !== undefined) updateData['state'] = String(data['state'])
  if (data['pincode'] !== undefined) updateData['pincode'] = String(data['pincode'])
  if (data['experienceYears'] !== undefined) updateData['experienceYears'] = Number(data['experienceYears']) || 0

  // Aadhaar step in onboarding sends { aadhaarNumber }
  if (data['aadhaarNumber']) {
    updateData['aadhaarVerified'] = true
  }
  if (data['aadhaarVerified'] !== undefined) {
    updateData['aadhaarVerified'] = Boolean(data['aadhaarVerified'])
  }

  // Bank step in onboarding sends account details
  if (data['accountHolderName'] !== undefined) updateData['accountHolderName'] = String(data['accountHolderName'])
  if (data['bankAccountNumber'] !== undefined) {
    updateData['bankAccountNumber'] = String(data['bankAccountNumber'])
    updateData['bankVerified'] = true
  }
  if (data['ifscCode'] !== undefined) updateData['ifscCode'] = String(data['ifscCode']).toUpperCase()
  if (data['upiId'] !== undefined) updateData['upiId'] = String(data['upiId'])
  if (data['bankVerified'] !== undefined) {
    updateData['bankVerified'] = Boolean(data['bankVerified'])
  }

  return prisma.farmerProfile.update({
    where: { userId },
    data: updateData,
    include: {
      user: {
        select: { name: true, phone: true, avatarUrl: true },
      },
    },
  })
}

export async function getFarmerStats(userId: string) {
  const profile = await prisma.farmerProfile.findUnique({ where: { userId } })
  if (!profile) return { totalListings: 0, activeListings: 0, totalEarnings: 0, averageRating: 0, totalBookings: 0, pendingBookings: 0 }
  const [totalListings, activeListings, bookings] = await Promise.all([
    prisma.landListing.count({ where: { farmerId: profile.id } }),
    prisma.landListing.count({ where: { farmerId: profile.id, status: 'ACTIVE' } }),
    prisma.booking.findMany({ where: { farmerId: profile.id }, select: { farmerReceives: true, status: true } }),
  ])
  return { totalListings, activeListings, totalEarnings: bookings.filter((b: FarmerStatsBooking) => b.status === 'COMPLETED').reduce((s: number, b: FarmerStatsBooking) => s + b.farmerReceives, 0), averageRating: profile.rating, totalBookings: bookings.length, pendingBookings: bookings.filter((b: FarmerStatsBooking) => b.status === 'ENQUIRY').length }
}

export async function getFarmerBookings(userId: string) {
  const profile = await prisma.farmerProfile.findUnique({ where: { userId } })
  if (!profile) return []
  const bookings = await prisma.booking.findMany({ where: { farmerId: profile.id }, include: { listing: { select: { id: true, title: true, village: true, district: true, photos: true, pricePerMonth: true } }, renter: { select: { id: true, name: true, phone: true, avatarUrl: true } } }, orderBy: { createdAt: 'desc' } })
  return bookings.map((b: FarmerBooking) => ({
    ...b,
    listing: {
      ...b.listing,
      address: { village: b.listing.village, district: b.listing.district },
    },
  }))
}

export async function updateBookingStatus(bookingId: string, userId: string, status: string) {
  const profile = await prisma.farmerProfile.findUnique({ where: { userId } })
  if (!profile) throw new AppError('Farmer profile not found', 404, 'NOT_FOUND')
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND')
  if (booking.farmerId !== profile.id) throw new AppError('Forbidden', 403, 'FORBIDDEN')
  return prisma.booking.update({ where: { id: bookingId }, data: { status: status as never } })
}

export async function getFarmerListings(userId: string, limit?: number) {
  const profile = await prisma.farmerProfile.findUnique({ where: { userId } })
  if (!profile) return []
  const listings = await prisma.landListing.findMany({
    where: { farmerId: profile.id },
    orderBy: { createdAt: 'desc' },
    ...(limit && { take: limit }),
  })
  return listings.map((r: FarmerListing) => ({
    ...r,
    address: {
      village: r.village,
      tehsil: r.tehsil,
      district: r.district,
      state: r.state,
      pincode: r.pincode,
      geoPoint: { lat: r.lat, lng: r.lng },
    },
    cropDetails: {
      primaryCrop: r.primaryCrop,
      seedVariety: r.seedVariety,
      harvestSeason: r.harvestSeason,
      yieldMin: r.yieldMin,
      yieldMax: r.yieldMax,
      yieldUnit: r.yieldUnit,
      estimatedPriceMin: r.priceMin,
      estimatedPriceMax: r.priceMax,
      priceUnit: r.priceUnit,
      fertilizerPlan: r.fertilizerPlan,
      pesticidePlan: r.pesticidePlan,
    },
  }))
}
