import prisma from '../../lib/prisma'
import { AppError } from '../../middleware/error.middleware'
import { calcPlatformFee, addMonths } from '@khetly/utils'

type RenterBooking = {
  listing: { id: string; title: string; village: string; district: string; photos: string[]; pricePerMonth: number }
}

export async function createBooking(renterId: string, body: { listingId: string; startDate: string; durationMonths: number; selectedAddons: string[]; notes?: string }) {
  const listing = await prisma.landListing.findUnique({ where: { id: body.listingId }, include: { farmer: true } })
  if (!listing) throw new AppError('Listing not found', 404, 'NOT_FOUND')
  if (listing.status !== 'ACTIVE') throw new AppError('Listing is not available', 400, 'UNAVAILABLE')
  if (body.durationMonths < listing.minRentalMonths) throw new AppError(`Minimum rental is ${listing.minRentalMonths} months`, 400, 'INVALID_DURATION')
  const startDate = new Date(body.startDate)
  const endDate = addMonths(startDate, body.durationMonths)
  const totalAmount = listing.pricePerMonth * body.durationMonths
  const { platformFee, farmerReceives } = calcPlatformFee(totalAmount)
  const b = await prisma.booking.create({ data: { listingId: body.listingId, renterId, farmerId: listing.farmerId, startDate, endDate, durationMonths: body.durationMonths, totalAmount, platformFeePercent: 8, platformFee, farmerReceives, selectedAddons: body.selectedAddons as never[], notes: body.notes, status: 'ENQUIRY' }, include: { listing: { select: { id: true, title: true, village: true, district: true, photos: true, pricePerMonth: true } } } })
  return {
    ...b,
    listing: {
      ...b.listing,
      address: { village: b.listing.village, district: b.listing.district },
    },
  }
}

export async function getRenterBookings(renterId: string) {
  const bookings = await prisma.booking.findMany({ where: { renterId }, include: { listing: { select: { id: true, title: true, village: true, district: true, photos: true, pricePerMonth: true } } }, orderBy: { createdAt: 'desc' } })
  return bookings.map((b: RenterBooking) => ({
    ...b,
    listing: {
      ...b.listing,
      address: { village: b.listing.village, district: b.listing.district },
    },
  }))
}

export async function cancelBooking(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND')
  if (booking.renterId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN')
  if (!['ENQUIRY', 'CONFIRMED'].includes(booking.status)) throw new AppError('Cannot cancel booking in current status', 400, 'INVALID_STATUS')
  return prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } })
}
