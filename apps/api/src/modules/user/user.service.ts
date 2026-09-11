import prisma from '../../lib/prisma'

type CompletedBooking = { totalAmount: number }
type UserBooking = { listing: { village: string; district: string } }

export async function updateMe(userId: string, data: { name?: string; preferredLanguage?: string }) {
  return prisma.user.update({ where: { id: userId }, data, select: { id: true, phone: true, role: true, name: true, isVerified: true, avatarUrl: true, preferredLanguage: true, createdAt: true } })
}

export async function getMyStats(userId: string) {
  const [totalBookings, activeBookings, completedBookings] = await Promise.all([
    prisma.booking.count({ where: { renterId: userId } }),
    prisma.booking.count({ where: { renterId: userId, status: 'ACTIVE' } }),
    prisma.booking.findMany({ where: { renterId: userId, status: 'COMPLETED' }, select: { totalAmount: true } }),
  ])
  return { totalBookings, activeBookings, totalSpent: completedBookings.reduce((s: number, b: CompletedBooking) => s + b.totalAmount, 0), listingsViewed: 0 }
}

export async function getMyBookings(userId: string, limit?: number) {
  const bookings = await prisma.booking.findMany({ where: { renterId: userId }, include: { listing: { select: { id: true, title: true, village: true, district: true, photos: true, pricePerMonth: true } } }, orderBy: { createdAt: 'desc' }, ...(limit && { take: limit }) })
  return bookings.map((b: UserBooking) => ({
    ...b,
    listing: {
      ...b.listing,
      address: { village: b.listing.village, district: b.listing.district },
    },
  }))
}
