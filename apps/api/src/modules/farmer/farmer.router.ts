import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth.middleware'
import * as ctrl from './farmer.controller'

export const farmerRouter = Router()
farmerRouter.use(requireAuth, requireRole('FARMER', 'ADMIN'))
farmerRouter.get('/profile', ctrl.getProfile)
farmerRouter.patch('/profile', ctrl.updateProfile)
farmerRouter.get('/stats', ctrl.getStats)
farmerRouter.get('/bookings', ctrl.getBookings)
farmerRouter.patch('/bookings/:bookingId/status', ctrl.updateBookingStatus)
