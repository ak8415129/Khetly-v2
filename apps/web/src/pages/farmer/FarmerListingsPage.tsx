import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Eye, Trash2 } from 'lucide-react'
import { useMyListings, useDeleteListing } from '@modules/listings/listings.hooks'
import { ListingStatusBadge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/common/EmptyState'
import { formatINR } from '@khetly/utils'
import { Modal } from '@components/ui/Modal'
import { useState } from 'react'
import type { LandListing } from '@khetly/types'

export default function FarmerListingsPage() {
  const navigate = useNavigate()
  const { data: listings, isLoading } = useMyListings()
  const deleteListing = useDeleteListing()
  const [deleteTarget, setDeleteTarget] = useState<LandListing | null>(null)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-900">My Listings</h1>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/farmer/listings/new')}
        >
          Add listing
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : !listings?.length ? (
        <EmptyState
          icon="🌾"
          title="No listings yet"
          description="Create your first listing to start receiving enquiries from renters."
          action={{ label: 'Create listing', onClick: () => navigate('/farmer/listings/new') }}
        />
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="card p-4">
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-brand-50 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl">
                  {l.photos[0] ? (
                    <img src={l.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : '🌾'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">{l.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {l.cropDetails.primaryCrop} · {l.plotSizeAcres} acres · {l.address.district}
                      </p>
                    </div>
                    <ListingStatusBadge status={l.status} />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-sm font-semibold text-brand-600">{formatINR(l.pricePerMonth)}</span>
                      <span className="text-xs text-gray-400">/month</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/listings/${l.id}`)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/farmer/listings/${l.id}/edit`)}
                        className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(l)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>👁 {l.viewCount} views</span>
                <span>📋 {l.bookingCount} bookings</span>
                <span>Min {l.minRentalMonths} month{l.minRentalMonths > 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Archive listing?"
        description={`"${deleteTarget?.title}" will be archived and hidden from renters.`}
        size="sm"
      >
        <Modal.Footer>
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="destructive"
            loading={deleteListing.isPending}
            onClick={async () => {
              if (!deleteTarget) return
              await deleteListing.mutateAsync(deleteTarget.id)
              setDeleteTarget(null)
            }}
          >
            Archive
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
