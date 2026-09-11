import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware'
import * as ctrl from './user.controller'

export const userRouter = Router()
userRouter.use(requireAuth)
userRouter.patch('/me', ctrl.updateMe)
userRouter.get('/me/stats', ctrl.getMyStats)
userRouter.get('/me/bookings', ctrl.getMyBookings)
