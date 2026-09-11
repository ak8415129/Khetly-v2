import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 500, public code: string = 'INTERNAL_ERROR') {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: err.message, code: err.code, statusCode: err.statusCode })
  }
  if ((err as { code?: string }).code === 'P2002') {
    return res.status(409).json({ success: false, error: 'Resource already exists', code: 'CONFLICT', statusCode: 409 })
  }
  if ((err as { code?: string }).code === 'P2025') {
    return res.status(404).json({ success: false, error: 'Resource not found', code: 'NOT_FOUND', statusCode: 404 })
  }
  console.error('Unhandled error:', err)
  return res.status(500).json({ success: false, error: env.NODE_ENV === 'production' ? 'Internal server error' : err.message, code: 'INTERNAL_ERROR', statusCode: 500 })
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: 'Route not found', code: 'NOT_FOUND', statusCode: 404 })
}
