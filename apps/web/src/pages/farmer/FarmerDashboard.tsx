import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, List, CalendarDays, TrendingUp, Star } from 'lucide-react'
import { apiClient } from '@lib/api-client'
import { useAuthStore } from '@modules/auth/auth.store'
import { ListingStatusBadge, BookingStatusBadge } from '@components/ui/Badge'
import { DashboardStatsSkeleton, Skeleton } from '@components/ui/Skeleton'
import { Button } from '@components/ui/Button'
import { EmptyState } from '@components/common/EmptyState'
import { formatINR, formatDate } from '@khetly/utils'
import type { LandListing, Booking } from '@khetly/types'

interface FarmerStats {
  totalListings: number
  activeListings: number
  totalEarnings: number
  averageRating: number
  totalBookings: number
  pendingBookings: number
}

export default function FarmerDashboard() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'farmer', 'stats'],
    queryFn: () => apiClient.get<FarmerStats>('/farmer/stats') as Promise<FarmerStats>,
  })

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['farmer', 'listings', 'recent'],
    queryFn: () => apiClient.get<LandListing[]>('/farmer/listings?limit=3') as Promise<LandListing[]>,
  })

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['farmer', 'bookings', 'recent'],
    queryFn: () => apiClient.get<Booking[]>('/farmer/bookings?limit=3') as Promise<Booking[]>,
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">
            {greeting}, {user?.name?.split(' ')[0] ?? 'Kisan'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your listings and bookings</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/farmer/listings/new')}
        >
          Add listing
        </Button>
      </div>

      {/* Stats */}
      {statsLoading ? <DashboardStatsSkeleton /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: List, label: 'Active listings', value: stats?.activeListings ?? 0, color: 'text-brand-600 bg-brand-50' },
            { icon: CalendarDays, label: 'Total bookings', value: stats?.totalBookings ?? 0, color: 'text-blue-600 bg-blue-50' },
            { icon: TrendingUp, label: 'Total earnings', value: formatINR(stats?.totalEarnings ?? 0), color: 'text-amber-600 bg-amber-50' },
            { icon: Star, label: 'Avg. rating', value: stats?.averageRating ? stats.averageRating.toFixed(1) : '—', color: 'text-purple-600 bg-purple-50' },
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

      {/* Recent listings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-900">Recent listings</h2>
          <button onClick={() => navigate('/farmer/listings')} className="text-xs text-brand-600 hover:underline">
            View all
          </button>
        </div>

        {listingsLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : !listings?.length ? (
          <EmptyState
            icon="🌾"
            title="No listings yet"
            description="Create your first listing to start earning."
            action={{ label: 'Create listing', onClick: () => navigate('/farmer/listings/new') }}
          />
        ) : (
          <div className="space-y-3">
            {listings.map((l) => (
              <div key={l.id} className="card p-4 flex items-center justify-between gap-4 cursor-pointer hover:shadow-card-hover transition-shadow" onClick={() => navigate(`/farmer/listings/${l.id}/edit`)}>
                <div>
                  <p className="text-sm font-medium text-gray-900">{l.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{l.cropDetails.primaryCrop} • {l.plotSizeAcres} acres</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <ListingStatusBadge status={l.status} />
                  <p className="text-sm font-semibold text-brand-600 mt-1.5">{formatINR(l.pricePerMonth)}/mo</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-900">Recent bookings</h2>
          <button onClick={() => navigate('/farmer/bookings')} className="text-xs text-brand-600 hover:underline">
            View all
          </button>
        </div>

        {bookingsLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : !bookings?.length ? (
          <p className="text-sm text-gray-400 py-4 text-center">No bookings yet</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{b.listing.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(b.startDate)} • {b.durationMonths} months</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <BookingStatusBadge status={b.status} />
                  <p className="text-sm font-semibold text-brand-600 mt-1.5">{formatINR(b.farmerReceives)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
