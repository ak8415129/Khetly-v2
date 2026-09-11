import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware'
import * as ctrl from './bookings.controller'

export const bookingsRouter = Router()
bookingsRouter.use(requireAuth)
bookingsRouter.post('/', ctrl.create)
bookingsRouter.get('/mine', ctrl.mine)
bookingsRouter.patch('/:id/cancel', ctrl.cancel)
