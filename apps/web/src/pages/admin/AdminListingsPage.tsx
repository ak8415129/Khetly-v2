import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@modules/admin/admin.service'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { Textarea } from '@components/ui/Input'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/common/EmptyState'
import { formatINR } from '@khetly/utils'
import toast from 'react-hot-toast'

interface PendingListing {
  id: string
  title: string
  primaryCrop: string
  plotSizeAcres: number
  village: string
  district: string
  pricePerMonth: number
  riskLevel: string
  riskDescription: string
  farmer: { user: { name: string; email: string } }
}

export default function AdminListingsPage() {
  const queryClient = useQueryClient()
  const [rejectTarget, setRejectTarget] = useState<PendingListing | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data: listings, isLoading } = useQuery({
    queryKey: ['admin', 'listings', 'pending'],
    queryFn: () => adminService.pendingListings() as Promise<PendingListing[]>,
  })

  const moderate = useMutation({
    mutationFn: ({ id, approve, reason }: { id: string; approve: boolean; reason?: string }) =>
      adminService.moderateListing(id, approve, reason),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings', 'pending'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success(vars.approve ? 'Listing approved and is now live' : 'Listing rejected')
      setRejectTarget(null)
      setRejectReason('')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-medium text-gray-900">Pending Listings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and approve farmer submissions before they go live</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : !listings?.length ? (
        <EmptyState icon="✅" title="All caught up" description="No listings waiting for review." />
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{l.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    by {l.farmer.user.name} ({l.farmer.user.email})
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {l.primaryCrop} · {l.plotSizeAcres} acres · {l.village}, {l.district}
                  </p>
                  <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg p-2">
                    <span className="font-medium">Risk ({l.riskLevel}):</span> {l.riskDescription}
                  </p>
                </div>
                <span className="text-sm font-semibold text-brand-600 whitespace-nowrap">
                  {formatINR(l.pricePerMonth)}/mo
                </span>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="primary"
                  loading={moderate.isPending}
                  onClick={() => moderate.mutate({ id: l.id, approve: true })}
                >
                  ✅ Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setRejectTarget(l)}>
                  ❌ Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject listing"
        description={`Tell ${rejectTarget?.farmer.user.name} why "${rejectTarget?.title}" was rejected.`}
      >
        <Textarea
          placeholder="e.g. Risk description is too vague, please add more detail about flooding risk..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
          <Button
            variant="destructive"
            loading={moderate.isPending}
            disabled={!rejectReason.trim()}
            onClick={() => rejectTarget && moderate.mutate({ id: rejectTarget.id, approve: false, reason: rejectReason })}
          >
            Reject listing
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
