import { apiClient } from '@lib/api-client'

export interface PlatformStats {
  totalUsers: number
  totalFarmers: number
  totalRenters: number
  totalListings: number
  activeListings: number
  pendingListings: number
  totalBookings: number
  completedBookings: number
  platformRevenue: number
  signupsByDay: Record<string, number>
}

export const adminService = {
  getStats: () => apiClient.get('/admin/stats') as Promise<PlatformStats>,

  listUsers: (params: { role?: string; search?: string; page?: number }) =>
    apiClient.get('/admin/users', { params }) as Promise<{ data: unknown[]; total: number; totalPages: number }>,

  suspendUser: (userId: string, reason: string) =>
    apiClient.patch(`/admin/users/${userId}/suspend`, { reason }),

  reactivateUser: (userId: string) =>
    apiClient.patch(`/admin/users/${userId}/reactivate`),

  pendingFarmers: () => apiClient.get('/admin/farmers/pending') as Promise<unknown[]>,

  verifyFarmer: (farmerId: string, approve: boolean, reason?: string) =>
    apiClient.patch(`/admin/farmers/${farmerId}/verify`, { approve, reason }),

  pendingListings: () => apiClient.get('/admin/listings/pending') as Promise<unknown[]>,

  moderateListing: (listingId: string, approve: boolean, reason?: string) =>
    apiClient.patch(`/admin/listings/${listingId}/moderate`, { approve, reason }),

  allBookings: (params: { status?: string; page?: number }) =>
    apiClient.get('/admin/bookings', { params }),

  auditLog: (page?: number) => apiClient.get('/admin/audit-log', { params: { page } }),
}
