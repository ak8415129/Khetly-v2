import prisma from '../../lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt'
import { verifyFirebaseToken } from '../../lib/firebase-admin'
import { AppError } from '../../middleware/error.middleware'
import { env } from '../../config/env'
import type { UserRole } from '@khetly/types'

// ─── Google Sign-In ───────────────────────────────────────────────────────────
// Called once the frontend has a Firebase ID token from the Google popup
export async function googleSignIn(idToken: string) {
  const decoded = await verifyFirebaseToken(idToken)

  if (!decoded.email_verified) {
    throw new AppError('Google email not verified', 401, 'EMAIL_NOT_VERIFIED')
  }

  let user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } })

  const isNewUser = !user

  if (!user) {
    // Auto-promote the configured first admin email — convenience for initial setup
    const role: UserRole =
      env.FIRST_ADMIN_EMAIL && decoded.email === env.FIRST_ADMIN_EMAIL ? 'ADMIN' : 'RENTER'

    user = await prisma.user.create({
      data: {
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name ?? '',
        avatarUrl: decoded.picture,
        role,
        isVerified: true,
        profileCompleted: role === 'ADMIN', // admins skip profile completion
      },
    })
  }

  if (!user.isActive) {
    throw new AppError('This account has been suspended. Contact support.', 403, 'ACCOUNT_SUSPENDED')
  }

  const tokens = await issueTokens(user.id, user.email, user.role as UserRole)

  return {
    user: serializeUser(user),
    tokens,
    isNewUser,
    needsProfileCompletion: !user.profileCompleted,
  }
}

// ─── Complete profile — role selection + name (after first Google login) ─────
export async function completeProfile(
  userId: string,
  data: { role: 'RENTER' | 'FARMER'; name: string; preferredLanguage?: string }
) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND')
  if (user.role === 'ADMIN') throw new AppError('Admins cannot change role here', 400, 'FORBIDDEN')

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      role: data.role,
      name: data.name,
      preferredLanguage: data.preferredLanguage ?? 'en',
      profileCompleted: true,
    },
  })

  // Farmers get an empty profile shell created immediately
  if (data.role === 'FARMER') {
    await prisma.farmerProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })
  }

  const tokens = await issueTokens(updated.id, updated.email, updated.role as UserRole)

  return { user: serializeUser(updated), tokens }
}

// ─── Refresh tokens ───────────────────────────────────────────────────────────
export async function refreshTokens(token: string) {
  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN')
  }
  if (payload.type !== 'refresh') throw new AppError('Invalid token type', 401, 'INVALID_TOKEN')

  const stored = await prisma.refreshToken.findUnique({ where: { token } })
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token expired. Please sign in again.', 401, 'TOKEN_EXPIRED')
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND')
  if (!user.isActive) throw new AppError('Account suspended', 403, 'ACCOUNT_SUSPENDED')

  await prisma.refreshToken.delete({ where: { token } })
  return issueTokens(user.id, user.email, user.role as UserRole)
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout(userId: string) {
  await prisma.refreshToken.deleteMany({ where: { userId } })
}

// ─── Get me ───────────────────────────────────────────────────────────────────
export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND')
  return serializeUser(user)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function issueTokens(userId: string, email: string, role: UserRole) {
  const accessToken = signAccessToken({ sub: userId, email, role })
  const refreshToken = signRefreshToken({ sub: userId, email, role })
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  await prisma.refreshToken.create({ data: { userId, token: refreshToken, expiresAt } })
  return { accessToken, refreshToken, expiresIn: 7 * 24 * 60 * 60 }
}

function serializeUser(user: {
  id: string; email: string; role: string; name: string
  avatarUrl: string | null; isVerified: boolean; profileCompleted: boolean
  preferredLanguage: string; createdAt: Date
}) {
  return {
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
    name: user.name ?? '',
    avatarUrl: user.avatarUrl ?? undefined,
    isVerified: user.isVerified,
    profileCompleted: user.profileCompleted,
    preferredLanguage: user.preferredLanguage as 'en' | 'hi',
    createdAt: user.createdAt.toISOString(),
  }
}
