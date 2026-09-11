import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth.middleware'
import * as ctrl from './listings.controller'

export const listingsRouter = Router()

listingsRouter.get('/', ctrl.search)
listingsRouter.get('/:id', ctrl.getById)
listingsRouter.post('/', requireAuth, requireRole('FARMER', 'ADMIN'), ctrl.create)
listingsRouter.patch('/:id', requireAuth, requireRole('FARMER', 'ADMIN'), ctrl.update)
listingsRouter.delete('/:id', requireAuth, requireRole('FARMER', 'ADMIN'), ctrl.remove)
listingsRouter.get('/farmer/mine', requireAuth, requireRole('FARMER', 'ADMIN'), ctrl.myListings)
