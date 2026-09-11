import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '@lib/api-client'
import { Modal } from '@components/ui/Modal'
import { Input, Textarea } from '@components/ui/Input'
import {
  MapPin, Star, Maximize2, Droplets, Leaf, AlertTriangle,
  Package, Video, TreePine, ArrowLeft, ShieldCheck,
} from 'lucide-react'
import { useListing } from '@modules/listings/listings.hooks'
import { ListingCardSkeleton } from '@components/ui/Skeleton'
import { RiskBadge, VerifiedBadge } from '@components/ui/Badge'
import { Avatar } from '@components/ui/Avatar'
import { Button } from '@components/ui/Button'
import { formatINR } from '@khetly/utils'
import { ADDON_META, SEASON_LABELS, LAND_TYPE_LABELS } from '@lib/utils'
import { useAuthStore } from '@modules/auth/auth.store'
import { AuthModal } from '@components/auth/AuthModal'

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data: listing, isLoading, isError } = useListing(id ?? '')

  const [enquireOpen, setEnquireOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(tomorrow)
  const [durationMonths, setDurationMonths] = useState<number>(1)
  const [notes, setNotes] = useState('')
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  function handleEnquire() {
    if (!isAuthenticated) {
      setAuthOpen(true)
      return
    }

    setDurationMonths(listing?.minRentalMonths || 1)
    setEnquireOpen(true)
  }

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!listing) return
      return apiClient.post('/bookings', {
        listingId: listing.id,
        startDate,
        durationMonths,
        selectedAddons,
        notes: notes.trim() || undefined,
      })
    },
    onSuccess: () => {
      toast.success('Enquiry sent to the farmer! 🌾')
      setEnquireOpen(false)
      navigate('/my-bookings')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to send enquiry')
    },
  })

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <ListingCardSkeleton />
      <ListingCardSkeleton />
    </div>
  )

  if (isError || !listing) return (
    <div className="text-center py-16">
      <p className="text-gray-500 mb-4">Listing not found.</p>
      <Button variant="outline" onClick={() => navigate('/explore')}>Back to explore</Button>
    </div>
  )

  const { farmer, cropDetails, address } = listing

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Photos */}
      <div className="rounded-xl overflow-hidden h-56 bg-brand-50">
        {listing.photos[0] ? (
          <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🌾</div>
        )}
      </div>

      {/* Title + badges */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="text-xl font-medium text-gray-900">{listing.title}</h1>
          <RiskBadge level={listing.riskLevel} />
        </div>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {address.village}, {address.tehsil}, {address.district}
        </p>
      </div>

      {/* Price CTA card */}
      <div className="card p-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold text-brand-600">
            {formatINR(listing.pricePerMonth)}
            <span className="text-sm font-normal text-gray-400"> / month</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Minimum {listing.minRentalMonths} {listing.minRentalMonths === 1 ? 'month' : 'months'} •{' '}
            {formatINR(listing.pricePerMonth * listing.minRentalMonths)} total minimum
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleEnquire}
        >
          Enquire now
        </Button>
      </div>

      {/* Farmer */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-900 mb-3">About the farmer</h2>
        <div className="flex items-center gap-3">
          <Avatar name={farmer.name} src={farmer.avatarUrl} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-gray-900">{farmer.name}</span>
              <VerifiedBadge status={farmer.verificationStatus} />
            </div>
            {farmer.rating > 0 && (
              <div className="flex items-center gap-1 text-sm text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                <span className="font-medium">{farmer.rating.toFixed(1)}</span>
                <span className="text-gray-400 text-xs">({farmer.reviewCount} reviews)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crop details */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-900 mb-3">Crop details</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Primary crop', value: cropDetails.primaryCrop },
            { label: 'Seed variety', value: cropDetails.seedVariety },
            { label: 'Harvest season', value: SEASON_LABELS[cropDetails.harvestSeason] },
            { label: 'Plot size', value: `${listing.plotSizeAcres} acres` },
            { label: 'Expected yield', value: `${cropDetails.yieldMin}–${cropDetails.yieldMax} ${cropDetails.yieldUnit}` },
            { label: 'Est. market price', value: `₹${cropDetails.estimatedPriceMin}–${cropDetails.estimatedPriceMax} ${cropDetails.priceUnit}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-sm font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Fertilizer plan
            </p>
            <p className="text-sm text-gray-700">{cropDetails.fertilizerPlan}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Droplets className="w-3 h-3" /> Pesticide plan
            </p>
            <p className="text-sm text-gray-700">{cropDetails.pesticidePlan}</p>
          </div>
        </div>
      </div>

      {/* Risk */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Risk disclosure
        </h2>
        <div className="flex items-center gap-2 mb-2">
          <RiskBadge level={listing.riskLevel} />
        </div>
        <p className="text-sm text-gray-600">{listing.riskDescription}</p>
      </div>

      {/* Land details */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-900 mb-3">Land & logistics</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{listing.plotSizeAcres} acres • {LAND_TYPE_LABELS[listing.landType]}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>Logistics: {listing.logistics.map(l => l.replace(/_/g, ' ')).join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Add-ons */}
      {listing.addons.length > 0 && (
        <div className="card p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Available add-ons</h2>
          <div className="grid grid-cols-2 gap-2">
            {listing.addons.map((addon) => {
              const meta = ADDON_META[addon]
              return (
                <div key={addon} className="flex items-center gap-2 bg-brand-50 rounded-lg p-2.5">
                  <span className="text-lg">{meta?.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-brand-800">{meta?.label}</p>
                    <p className="text-xs text-brand-600">{meta?.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sticky bottom CTA — mobile */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 p-4 bg-white border-t border-gray-100">
        <Button
          variant="primary"
          fullWidth
          onClick={handleEnquire}
        >
          Enquire — {formatINR(listing.pricePerMonth)}/month
        </Button>
      </div>

      {/* Enquiry Modal */}
      <Modal
        open={enquireOpen}
        onClose={() => setEnquireOpen(false)}
        title="Send Enquiry"
        description={`Enquire directly with ${farmer.name} for ${listing.title}.`}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Start date"
            type="date"
            min={tomorrow}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Duration (months)
            </label>
            <input
              type="number"
              min={listing.minRentalMonths}
              value={durationMonths}
              onChange={(e) => setDurationMonths(Math.max(listing.minRentalMonths, Number(e.target.value) || 1))}
              className="input-base"
            />
            <span className="text-xs text-gray-400 mt-1 block">
              Minimum duration: {listing.minRentalMonths} month(s)
            </span>
          </div>

          {listing.addons.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Select Add-ons (Optional)
              </label>
              <div className="space-y-2">
                {listing.addons.map((addon) => {
                  const meta = ADDON_META[addon]
                  const isChecked = selectedAddons.includes(addon)
                  return (
                    <label key={addon} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedAddons([...selectedAddons, addon])
                          else setSelectedAddons(selectedAddons.filter((a) => a !== addon))
                        }}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-base">{meta?.icon}</span>
                      <div className="text-xs">
                        <span className="font-medium text-gray-800">{meta?.label}</span>
                        <p className="text-gray-500">{meta?.description}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <Textarea
            label="Message to farmer (optional)"
            placeholder="Tell the farmer about yourself, intended crops, or questions you have..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 flex justify-between items-center text-sm">
            <div>
              <span className="text-gray-600 block text-xs">Estimated Total</span>
              <span className="font-semibold text-brand-800 text-base">
                {formatINR(listing.pricePerMonth * durationMonths)}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {formatINR(listing.pricePerMonth)} × {durationMonths} mo
            </span>
          </div>

          <Modal.Footer>
            <Button variant="outline" type="button" onClick={() => setEnquireOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              loading={bookingMutation.isPending}
              onClick={() => bookingMutation.mutate()}
            >
              Submit Enquiry →
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        returnTo={location.pathname}
      />
    </div>
  )
}
