import prisma from '../../lib/prisma'
import { AppError } from '../../middleware/error.middleware'

type RecentUser = { createdAt: Date }

// ─── Platform-wide stats ──────────────────────────────────────────────────────
export async function getPlatformStats() {
  const [
    totalUsers, totalFarmers, totalRenters,
    totalListings, activeListings, pendingListings,
    totalBookings, completedBookings,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'FARMER' } }),
    prisma.user.count({ where: { role: 'RENTER' } }),
    prisma.landListing.count(),
    prisma.landListing.count({ where: { status: 'ACTIVE' } }),
    prisma.landListing.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.aggregate({ where: { status: 'COMPLETED' }, _sum: { platformFee: true } }),
  ])

  // Signups in the last 30 days, grouped by day — for a simple growth chart
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentUsers = await prisma.user.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  })

  const signupsByDay: Record<string, number> = {}
  recentUsers.forEach((u: RecentUser) => {
    const day = u.createdAt.toISOString().slice(0, 10)
    signupsByDay[day] = (signupsByDay[day] ?? 0) + 1
  })

  return {
    totalUsers, totalFarmers, totalRenters,
    totalListings, activeListings, pendingListings,
    totalBookings, completedBookings,
    platformRevenue: totalRevenue._sum.platformFee ?? 0,
    signupsByDay,
  }
}

// ─── User management ──────────────────────────────────────────────────────────
export async function listUsers(params: { role?: string; search?: string; page?: number; pageSize?: number }) {
  const { role, search, page = 1, pageSize = 20 } = params
  const where: Record<string, unknown> = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize, take: pageSize,
      include: { farmerProfile: { select: { verificationStatus: true } } },
    }),
    prisma.user.count({ where }),
  ])

  return { data: users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function suspendUser(adminId: string, targetUserId: string, reason: string) {
  const target = await prisma.user.findUnique({ where: { id: targetUserId } })
  if (!target) throw new AppError('User not found', 404, 'NOT_FOUND')
  if (target.role === 'ADMIN') throw new AppError('Cannot suspend an admin account', 400, 'FORBIDDEN')

  await prisma.user.update({ where: { id: targetUserId }, data: { isActive: false } })
  // Revoke all their sessions immediately
  await prisma.refreshToken.deleteMany({ where: { userId: targetUserId } })

  await logAdminAction(adminId, 'SUSPEND_USER', 'User', targetUserId, reason)
  return { success: true }
}

export async function reactivateUser(adminId: string, targetUserId: string) {
  const target = await prisma.user.findUnique({ where: { id: targetUserId } })
  if (!target) throw new AppError('User not found', 404, 'NOT_FOUND')

  await prisma.user.update({ where: { id: targetUserId }, data: { isActive: true } })
  await logAdminAction(adminId, 'REACTIVATE_USER', 'User', targetUserId)
  return { success: true }
}

// ─── Farmer verification ──────────────────────────────────────────────────────
export async function listPendingFarmerVerifications() {
  return prisma.farmerProfile.findMany({
    where: { verificationStatus: { in: ['PENDING', 'IN_REVIEW'] } },
    include: { user: { select: { name: true, email: true, avatarUrl: true, createdAt: true } } },
    orderBy: { createdAt: 'asc' },
  })
}

export async function verifyFarmer(adminId: string, farmerProfileId: string, approve: boolean, reason?: string) {
  const profile = await prisma.farmerProfile.findUnique({ where: { id: farmerProfileId } })
  if (!profile) throw new AppError('Farmer profile not found', 404, 'NOT_FOUND')

  const updated = await prisma.farmerProfile.update({
    where: { id: farmerProfileId },
    data: {
      verificationStatus: approve ? 'VERIFIED' : 'REJECTED',
      aadhaarVerified: approve,
      bankVerified: approve,
    },
  })

  await logAdminAction(adminId, approve ? 'VERIFY_FARMER' : 'REJECT_FARMER', 'FarmerProfile', farmerProfileId, reason)
  return updated
}

// ─── Listing moderation ───────────────────────────────────────────────────────
export async function listPendingListings() {
  return prisma.landListing.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: { farmer: { include: { user: { select: { name: true, email: true } } } } },
    orderBy: { createdAt: 'asc' },
  })
}

export async function moderateListing(adminId: string, listingId: string, approve: boolean, reason?: string) {
  const listing = await prisma.landListing.findUnique({ where: { id: listingId } })
  if (!listing) throw new AppError('Listing not found', 404, 'NOT_FOUND')

  const updated = await prisma.landListing.update({
    where: { id: listingId },
    data: {
      status: approve ? 'ACTIVE' : 'REJECTED',
      rejectionReason: approve ? null : reason,
    },
  })

  await logAdminAction(adminId, approve ? 'APPROVE_LISTING' : 'REJECT_LISTING', 'LandListing', listingId, reason)
  return updated
}

export async function removeListing(adminId: string, listingId: string, reason: string) {
  const listing = await prisma.landListing.findUnique({ where: { id: listingId } })
  if (!listing) throw new AppError('Listing not found', 404, 'NOT_FOUND')

  await prisma.landListing.update({ where: { id: listingId }, data: { status: 'ARCHIVED' } })
  await logAdminAction(adminId, 'REMOVE_LISTING', 'LandListing', listingId, reason)
  return { success: true }
}

// ─── All bookings (oversight) ─────────────────────────────────────────────────
export async function listAllBookings(params: { status?: string; page?: number; pageSize?: number }) {
  const { status, page = 1, pageSize = 20 } = params
  const where = status ? { status: status as never } : {}

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where, orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize, take: pageSize,
      include: {
        listing: { select: { title: true } },
        renter: { select: { name: true, email: true } },
        farmer: { include: { user: { select: { name: true, email: true } } } },
      },
    }),
    prisma.booking.count({ where }),
  ])

  return { data: bookings, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

// ─── Audit log ─────────────────────────────────────────────────────────────────
export async function getAuditLog(page = 1, pageSize = 50) {
  const [actions, total] = await Promise.all([
    prisma.adminAction.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize, take: pageSize,
      include: { admin: { select: { name: true, email: true } } },
    }),
    prisma.adminAction.count(),
  ])
  return { data: actions, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

async function logAdminAction(adminId: string, action: string, targetType: string, targetId: string, reason?: string) {
  await prisma.adminAction.create({ data: { adminId, action, targetType, targetId, reason } })
}
