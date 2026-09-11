import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/api-client'
import { BookingStatusBadge } from '@components/ui/Badge'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/common/EmptyState'
import { formatINR, formatDate } from '@khetly/utils'
import { useNavigate } from 'react-router-dom'
import type { Booking } from '@khetly/types'

function useMyBookings() {
  return useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn: () => apiClient.get<Booking[]>('/bookings/mine'),
  })
}

export default function BookingsPage() {
  const { data: bookings, isLoading } = useMyBookings()
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-medium text-gray-900">My Bookings</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : !bookings?.length ? (
        <EmptyState
          icon="🌾"
          title="No bookings yet"
          description="Browse available farmland and make your first booking."
          action={{ label: 'Explore listings', onClick: () => navigate('/explore') }}
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="card p-4 flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-brand-50 overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl">
                  {b.listing.photos[0] ? (
                    <img src={b.listing.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : '🌾'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{b.listing.title}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    {(b.listing as any).address?.village ?? (b.listing as any).village ?? ''}
                    {((b.listing as any).address?.district ?? (b.listing as any).district) ? `, ${(b.listing as any).address?.district ?? (b.listing as any).district}` : ''}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(b.startDate)} → {formatDate(b.endDate)}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <BookingStatusBadge status={b.status} />
                <p className="text-sm font-semibold text-brand-600 mt-2">
                  {formatINR(b.totalAmount)}
                </p>
                <p className="text-xs text-gray-400">{b.durationMonths} months</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
