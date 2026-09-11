import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../../middleware/validate.middleware'
import { requireAuth } from '../../middleware/auth.middleware'
import * as ctrl from './auth.controller'

export const authRouter = Router()

const googleSignInSchema = z.object({
  idToken: z.string().min(1, 'Firebase ID token required'),
})

const completeProfileSchema = z.object({
  role: z.enum(['RENTER', 'FARMER']),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  preferredLanguage: z.enum(['en', 'hi']).optional(),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
})

// POST /v1/auth/google — verify Firebase token, login or create account
authRouter.post('/google', validate({ body: googleSignInSchema }), ctrl.googleSignIn)

// POST /v1/auth/complete-profile — first-time role + name setup (requires auth)
authRouter.post('/complete-profile', requireAuth, validate({ body: completeProfileSchema }), ctrl.completeProfile)

// POST /v1/auth/token/refresh
authRouter.post('/token/refresh', validate({ body: refreshSchema }), ctrl.refreshToken)

// POST /v1/auth/logout  (requires auth)
authRouter.post('/logout', requireAuth, ctrl.logout)

// GET /v1/auth/me  (requires auth)
authRouter.get('/me', requireAuth, ctrl.me)
