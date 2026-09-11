import { Router } from 'express'
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware'
import * as ctrl from './admin.controller'

export const adminRouter = Router()

// Every route below requires a logged-in ADMIN
adminRouter.use(requireAuth, requireAdmin)

// Dashboard
adminRouter.get('/stats', ctrl.getStats)

// Users
adminRouter.get('/users', ctrl.listUsers)
adminRouter.patch('/users/:userId/suspend', ctrl.suspendUser)
adminRouter.patch('/users/:userId/reactivate', ctrl.reactivateUser)

// Farmer verification
adminRouter.get('/farmers/pending', ctrl.pendingFarmers)
adminRouter.patch('/farmers/:farmerId/verify', ctrl.verifyFarmer)

// Listing moderation
adminRouter.get('/listings/pending', ctrl.pendingListings)
adminRouter.patch('/listings/:listingId/moderate', ctrl.moderateListing)
adminRouter.patch('/listings/:listingId/remove', ctrl.removeListing)

// Bookings oversight
adminRouter.get('/bookings', ctrl.allBookings)

// Audit trail
adminRouter.get('/audit-log', ctrl.auditLog)
