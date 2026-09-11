import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@lib/api-client'
import { BookingStatusBadge } from '@components/ui/Badge'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/common/EmptyState'
import { Button } from '@components/ui/Button'
import { formatINR, formatDate } from '@khetly/utils'
import toast from 'react-hot-toast'
import type { BookingStatus } from '@khetly/types'

interface FarmerBooking {
  id: string
  status: BookingStatus
  startDate: string
  endDate: string
  durationMonths: number
  totalAmount: number
  farmerReceives: number
  notes?: string
  listing: { id: string; title: string; village: string; district: string; photos: string[] }
  renter: { id: string; name: string; phone: string; avatarUrl?: string }
}

function useFarmerBookings() {
  return useQuery({
    queryKey: ['farmer', 'bookings', 'all'],
    queryFn: () => apiClient.get<FarmerBooking[]>('/farmer/bookings') as Promise<FarmerBooking[]>,
  })
}

function useUpdateBookingStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: string }) =>
      apiClient.patch(`/farmer/bookings/${bookingId}/status`, { status }) as Promise<unknown>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer', 'bookings'] })
      toast.success('Booking status updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export default function FarmerBookingsPage() {
  const { data: bookings, isLoading } = useFarmerBookings()
  const updateStatus = useUpdateBookingStatus()

  const grouped = {
    pending: bookings?.filter(b => b.status === 'ENQUIRY') ?? [],
    active: bookings?.filter(b => ['CONFIRMED', 'ACTIVE'].includes(b.status)) ?? [],
    past: bookings?.filter(b => ['COMPLETED', 'CANCELLED', 'DISPUTED'].includes(b.status)) ?? [],
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-gray-900">Bookings</h1>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : !bookings?.length ? (
        <EmptyState icon="📋" title="No bookings yet" description="Once renters enquire about your listings, bookings will appear here." />
      ) : (
        <div className="space-y-8">
          {/* Pending enquiries */}
          {grouped.pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg inline-block mb-3">
                🔔 Pending enquiries ({grouped.pending.length})
              </h2>
              <div className="space-y-3">
                {grouped.pending.map(b => (
                  <BookingCard key={b.id} booking={b} onUpdateStatus={(status) => updateStatus.mutate({ bookingId: b.id, status })} isUpdating={updateStatus.isPending} />
                ))}
              </div>
            </div>
          )}

          {/* Active bookings */}
          {grouped.active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg inline-block mb-3">
                ✅ Active bookings ({grouped.active.length})
              </h2>
              <div className="space-y-3">
                {grouped.active.map(b => (
                  <BookingCard key={b.id} booking={b} onUpdateStatus={(status) => updateStatus.mutate({ bookingId: b.id, status })} isUpdating={updateStatus.isPending} />
                ))}
              </div>
            </div>
          )}

          {/* Past bookings */}
          {grouped.past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg inline-block mb-3">
                Past bookings ({grouped.past.length})
              </h2>
              <div className="space-y-3">
                {grouped.past.map(b => (
                  <BookingCard key={b.id} booking={b} isUpdating={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BookingCard({ booking: b, onUpdateStatus, isUpdating }: {
  booking: FarmerBooking
  onUpdateStatus?: (status: string) => void
  isUpdating: boolean
}) {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-lg bg-brand-50 flex-shrink-0 flex items-center justify-center text-xl overflow-hidden">
            {b.listing.photos[0] ? <img src={b.listing.photos[0]} alt="" className="w-full h-full object-cover" /> : '🌾'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{b.listing.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{b.listing.village}, {b.listing.district}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(b.startDate)} → {formatDate(b.endDate)} ({b.durationMonths} months)</p>
          </div>
        </div>
        <BookingStatusBadge status={b.status} />
      </div>

      {/* Renter info */}
      <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Renter</p>
          <p className="text-sm font-medium text-gray-900">{b.renter.name || 'Unknown'}</p>
          <p className="text-xs text-gray-500">+91 {b.renter.phone}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">You receive</p>
          <p className="text-base font-semibold text-brand-600">{formatINR(b.farmerReceives)}</p>
        </div>
      </div>

      {b.notes && (
        <p className="text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">💬 {b.notes}</p>
      )}

      {/* Action buttons */}
      {b.status === 'ENQUIRY' && onUpdateStatus && (
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="primary" loading={isUpdating} onClick={() => onUpdateStatus('CONFIRMED')}>
            ✅ Confirm booking
          </Button>
          <Button size="sm" variant="outline" loading={isUpdating} onClick={() => onUpdateStatus('CANCELLED')}>
            Decline
          </Button>
        </div>
      )}
      {b.status === 'CONFIRMED' && onUpdateStatus && (
        <Button size="sm" variant="secondary" loading={isUpdating} onClick={() => onUpdateStatus('ACTIVE')}>
          Mark as active
        </Button>
      )}
      {b.status === 'ACTIVE' && onUpdateStatus && (
        <Button size="sm" variant="secondary" loading={isUpdating} onClick={() => onUpdateStatus('COMPLETED')}>
          Mark as completed
        </Button>
      )}
    </div>
  )
}
