import type { Request, Response, NextFunction } from 'express'
import * as authService from './auth.service'

export async function googleSignIn(req: Request, res: Response, next: NextFunction) {
  try {
    const { idToken } = req.body
    const data = await authService.googleSignIn(idToken)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function completeProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await authService.completeProfile(req.userId, req.body)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body
    const data = await authService.refreshTokens(refreshToken)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.userId)
    res.json({ success: true, data: null, message: 'Logged out' })
  } catch (err) { next(err) }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await authService.getMe(req.userId)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}
