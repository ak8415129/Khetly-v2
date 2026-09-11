import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../lib/jwt'
import prisma from '../lib/prisma'
import type { UserRole } from '@khetly/types'

declare global {
  namespace Express {
    interface Request {
      userId: string
      userRole: UserRole
      userEmail: string
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization']

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false, error: 'Authentication required. Please sign in.',
        code: 'UNAUTHORIZED', statusCode: 401,
      })
    }

    const token = authHeader.slice(7)

    let payload
    try {
      payload = verifyAccessToken(token)
    } catch (err: unknown) {
      const isExpired = err instanceof Error && err.message.includes('expired')
      return res.status(401).json({
        success: false,
        error: isExpired ? 'Session expired.' : 'Invalid session. Please sign in again.',
        code: 'UNAUTHORIZED', statusCode: 401,
      })
    }

    if (payload.type !== 'access') {
      return res.status(401).json({ success: false, error: 'Invalid token type.', code: 'UNAUTHORIZED', statusCode: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, email: true, isActive: true },
    })

    if (!user) {
      return res.status(401).json({ success: false, error: 'Account not found.', code: 'UNAUTHORIZED', statusCode: 401 })
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'This account has been suspended.', code: 'ACCOUNT_SUSPENDED', statusCode: 403 })
    }

    req.userId = user.id
    req.userRole = user.role as UserRole
    req.userEmail = user.email

    return next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    return res.status(401).json({ success: false, error: 'Authentication failed.', code: 'UNAUTHORIZED', statusCode: 401 })
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false, error: `Access denied. Required role: ${roles.join(' or ')}`,
        code: 'FORBIDDEN', statusCode: 403,
      })
    }
    return next()
  }
}

// Convenience shortcut — used heavily by the admin module
export const requireAdmin = requireRole('ADMIN')
