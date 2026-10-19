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
  const bookings = await prisma.booking.findMany({
    where: { renterId },
    include: {
      listing: { select: { id: true, title: true, village: true, district: true, photos: true, pricePerMonth: true } },
      review: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return bookings.map((b: any) => ({
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

export async function raiseDispute(bookingId: string, userId: string, reason: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND')
  if (booking.renterId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN')
  if (!['ACTIVE', 'COMPLETED', 'CONFIRMED'].includes(booking.status)) {
    throw new AppError('Disputes can only be raised for confirmed, active or completed bookings', 400, 'INVALID_STATUS')
  }

  const updatedNotes = booking.notes
    ? `[DISPUTE: ${reason}]\n${booking.notes}`
    : `[DISPUTE: ${reason}]`

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'DISPUTED',
      notes: updatedNotes,
    },
  })
}

export async function createBookingReview(
  bookingId: string,
  userId: string,
  data: { rating: number; comment: string; yieldAccuracy?: number; farmerResponsiveness?: number; valueForMoney?: number }
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  })
  if (!booking) throw new AppError('Booking not found', 404, 'NOT_FOUND')
  if (booking.renterId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN')
  if (booking.status !== 'COMPLETED') throw new AppError('Reviews can only be submitted for completed rentals', 400, 'NOT_COMPLETED')
  if (booking.review) throw new AppError('A review has already been submitted for this booking', 400, 'ALREADY_REVIEWED')

  const rating = Math.min(5, Math.max(1, Math.round(data.rating || 5)))
  const yieldAccuracy = Math.min(5, Math.max(1, Math.round(data.yieldAccuracy || rating)))
  const farmerResponsiveness = Math.min(5, Math.max(1, Math.round(data.farmerResponsiveness || rating)))
  const valueForMoney = Math.min(5, Math.max(1, Math.round(data.valueForMoney || rating)))

  const review = await prisma.review.create({
    data: {
      bookingId,
      reviewerId: userId,
      listingId: booking.listingId,
      rating,
      comment: data.comment || '',
      yieldAccuracy,
      farmerResponsiveness,
      valueForMoney,
    },
  })

  // Update farmer average rating & review count
  const allReviews = await prisma.review.findMany({
    where: { listing: { farmerId: booking.farmerId } },
    select: { rating: true },
  })
  const total = allReviews.reduce((sum, r) => sum + r.rating, 0)
  const averageRating = allReviews.length > 0 ? total / allReviews.length : rating

  await prisma.farmerProfile.update({
    where: { id: booking.farmerId },
    data: {
      rating: parseFloat(averageRating.toFixed(2)),
      reviewCount: allReviews.length,
    },
  })

  return review
}

