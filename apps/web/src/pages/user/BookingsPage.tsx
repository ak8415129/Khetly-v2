import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@lib/api-client'
import { BookingStatusBadge } from '@components/ui/Badge'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/common/EmptyState'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { formatINR, formatDate } from '@khetly/utils'
import { useNavigate } from 'react-router-dom'
import { Star, AlertTriangle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Booking } from '@khetly/types'

interface ExtendedBooking extends Booking {
  review?: {
    id: string
    rating: number
    comment: string
    createdAt: string
  } | null
}

function useMyBookings() {
  return useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn: () => apiClient.get<ExtendedBooking[]>('/bookings/mine'),
  })
}

export default function BookingsPage() {
  const { data: bookings, isLoading } = useMyBookings()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Modal states
  const [reviewBooking, setReviewBooking] = useState<ExtendedBooking | null>(null)
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [yieldAccuracy, setYieldAccuracy] = useState(5)
  const [responsiveness, setResponsiveness] = useState(5)
  const [valueForMoney, setValueForMoney] = useState(5)

  const [disputeBooking, setDisputeBooking] = useState<ExtendedBooking | null>(null)
  const [disputeReason, setDisputeReason] = useState('')

  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null)

  // Mutations
  const submitReview = useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: any }) =>
      apiClient.post(`/bookings/${bookingId}/review`, data),
    onSuccess: () => {
      toast.success('Thank you! Your review has been submitted.')
      queryClient.invalidateQueries({ queryKey: ['bookings', 'mine'] })
      setReviewBooking(null)
      setReviewComment('')
    },
    onError: (err: any) => toast.error(err.message || 'Failed to submit review'),
  })

  const submitDispute = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      apiClient.patch(`/bookings/${bookingId}/dispute`, { reason }),
    onSuccess: () => {
      toast.success('Dispute raised. Admin team will review and contact you.')
      queryClient.invalidateQueries({ queryKey: ['bookings', 'mine'] })
      setDisputeBooking(null)
      setDisputeReason('')
    },
    onError: (err: any) => toast.error(err.message || 'Failed to raise dispute'),
  })

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => apiClient.patch(`/bookings/${bookingId}/cancel`),
    onSuccess: () => {
      toast.success('Booking cancelled.')
      queryClient.invalidateQueries({ queryKey: ['bookings', 'mine'] })
      setCancelBookingId(null)
    },
    onError: (err: any) => toast.error(err.message || 'Failed to cancel booking'),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-900">My Bookings</h1>
        <Button variant="outline" size="sm" onClick={() => navigate('/explore')}>
          Explore farmland
        </Button>
      </div>

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
            <div key={b.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-brand-50 overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl">
                    {b.listing?.photos?.[0] ? (
                      <img src={b.listing.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : '🌾'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{b.listing?.title ?? 'Listing'}</p>
                    <p className="text-xs text-gray-500 mb-1">
                      {(b.listing as any).address?.village ?? (b.listing as any).village ?? ''}
                      {((b.listing as any).address?.district ?? (b.listing as any).district) ? `, ${(b.listing as any).address?.district ?? (b.listing as any).district}` : ''}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(b.startDate)} → {formatDate(b.endDate)} ({b.durationMonths} months)
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <BookingStatusBadge status={b.status} />
                  <p className="text-sm font-semibold text-brand-600 mt-2">
                    {formatINR(b.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Notes / Dispute banner if any */}
              {b.notes && (
                <div className={`text-xs px-3 py-2 rounded-lg ${b.status === 'DISPUTED' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-50 text-gray-600'}`}>
                  {b.notes}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {/* Rating / Review status */}
                  {b.review ? (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      Rated {b.review.rating}/5
                    </span>
                  ) : b.status === 'COMPLETED' ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setReviewBooking(b)}
                      leftIcon={<Star className="w-3.5 h-3.5" />}
                    >
                      Rate & Review
                    </Button>
                  ) : null}

                  {/* Raise Dispute button for active/completed bookings */}
                  {['ACTIVE', 'COMPLETED', 'CONFIRMED'].includes(b.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                      onClick={() => setDisputeBooking(b)}
                      leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
                    >
                      Raise Dispute
                    </Button>
                  )}
                </div>

                {/* Cancel option for early stages */}
                {['ENQUIRY', 'CONFIRMED'].includes(b.status) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-500 hover:text-red-600"
                    onClick={() => setCancelBookingId(b.id)}
                    leftIcon={<XCircle className="w-3.5 h-3.5" />}
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        open={!!reviewBooking}
        onClose={() => setReviewBooking(null)}
        title="Rate & Review Farmland"
        description="Share your experience to help other renters and reward responsible farmers."
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1.5 block">Overall Rating (1 - 5 stars)</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-500' : 'text-gray-300'}`}
                  />
                </button>
              ))}
              <span className="text-sm font-semibold text-gray-700 ml-2">{rating} / 5</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Yield Accuracy</label>
              <select
                value={yieldAccuracy}
                onChange={(e) => setYieldAccuracy(Number(e.target.value))}
                className="w-full text-xs rounded-lg border-gray-300 p-2 border"
              >
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Responsiveness</label>
              <select
                value={responsiveness}
                onChange={(e) => setResponsiveness(Number(e.target.value))}
                className="w-full text-xs rounded-lg border-gray-300 p-2 border"
              >
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Value for Money</label>
              <select
                value={valueForMoney}
                onChange={(e) => setValueForMoney(Number(e.target.value))}
                className="w-full text-xs rounded-lg border-gray-300 p-2 border"
              >
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Your review / comments</label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="How was the land quality, water availability, and communication?"
              className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <Modal.Footer>
          <Button variant="outline" onClick={() => setReviewBooking(null)}>Cancel</Button>
          <Button
            variant="primary"
            loading={submitReview.isPending}
            onClick={() => {
              if (!reviewBooking) return
              submitReview.mutate({
                bookingId: reviewBooking.id,
                data: {
                  rating,
                  comment: reviewComment,
                  yieldAccuracy,
                  farmerResponsiveness: responsiveness,
                  valueForMoney,
                },
              })
            }}
          >
            Submit Review
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        open={!!disputeBooking}
        onClose={() => setDisputeBooking(null)}
        title="Raise Dispute / Claim"
        description="Our resolution team protects your rental. Any payment release will be paused until this is resolved."
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            ⚠️ Raising a dispute will flag this booking for immediate Admin investigation. Please describe the issue clearly (e.g. crop failure, land condition discrepancy, unreachability).
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Dispute Details *</label>
            <textarea
              rows={4}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Please explain the issue or claim with details..."
              className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        <Modal.Footer>
          <Button variant="outline" onClick={() => setDisputeBooking(null)}>Cancel</Button>
          <Button
            variant="destructive"
            loading={submitDispute.isPending}
            disabled={!disputeReason.trim()}
            onClick={() => {
              if (!disputeBooking || !disputeReason.trim()) return
              submitDispute.mutate({
                bookingId: disputeBooking.id,
                reason: disputeReason.trim(),
              })
            }}
          >
            Submit Dispute
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        open={!!cancelBookingId}
        onClose={() => setCancelBookingId(null)}
        title="Cancel Booking?"
        description="Are you sure you want to cancel this rental booking enquiry?"
        size="sm"
      >
        <Modal.Footer>
          <Button variant="outline" onClick={() => setCancelBookingId(null)}>Keep Booking</Button>
          <Button
            variant="destructive"
            loading={cancelMutation.isPending}
            onClick={() => {
              if (cancelBookingId) cancelMutation.mutate(cancelBookingId)
            }}
          >
            Yes, Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

