import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, MapPin, TrendingUp, Leaf } from 'lucide-react'
import { apiClient } from '@lib/api-client'
import { useAuthStore } from '@modules/auth/auth.store'
import { BookingStatusBadge } from '@components/ui/Badge'
import { DashboardStatsSkeleton, Skeleton } from '@components/ui/Skeleton'
import { Button } from '@components/ui/Button'
import { EmptyState } from '@components/common/EmptyState'
import { formatINR, formatDate } from '@khetly/utils'
import type { Booking } from '@khetly/types'

interface DashboardStats {
  totalBookings: number
  activeBookings: number
  totalSpent: number
  listingsViewed: number
}

export default function RenterDashboard() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'renter', 'stats'],
    queryFn: () => apiClient.get<DashboardStats>('/users/me/stats') as Promise<DashboardStats>,
  })

  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', 'mine', 'recent'],
    queryFn: () => apiClient.get<Booking[]>('/bookings/mine?limit=3') as Promise<Booking[]>,
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-medium text-gray-900">
          {greeting}, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your farm rentals</p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <DashboardStatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: CalendarDays, label: 'Total bookings', value: stats?.totalBookings ?? 0, color: 'text-blue-600 bg-blue-50' },
            { icon: Leaf, label: 'Active rentals', value: stats?.activeBookings ?? 0, color: 'text-brand-600 bg-brand-50' },
            { icon: TrendingUp, label: 'Total spent', value: formatINR(stats?.totalSpent ?? 0), color: 'text-amber-600 bg-amber-50' },
            { icon: MapPin, label: 'Listings viewed', value: stats?.listingsViewed ?? 0, color: 'text-purple-600 bg-purple-50' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-xl font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-900 mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/explore')}>
            🌾 Explore listings
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/ai-assistant')}>
            🤖 Ask AI assistant
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/my-bookings')}>
            📋 View all bookings
          </Button>
        </div>
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-900">Recent bookings</h2>
          <button onClick={() => navigate('/my-bookings')} className="text-xs text-brand-600 hover:underline">
            View all
          </button>
        </div>

        {bookingsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : !recentBookings?.length ? (
          <EmptyState
            icon="🌱"
            title="No bookings yet"
            description="Find a plot and make your first booking."
            action={{ label: 'Explore now', onClick: () => navigate('/explore') }}
          />
        ) : (
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <div key={b.id} className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{b.listing.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {((b.listing as any).address?.village ?? (b.listing as any).village ?? 'Farm')} • {formatDate(b.startDate)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <BookingStatusBadge status={b.status} />
                  <p className="text-sm font-semibold text-brand-600 mt-1.5">
                    {formatINR(b.totalAmount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
