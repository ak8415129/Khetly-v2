import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@modules/admin/admin.service'
import { Button } from '@components/ui/Button'
import { Avatar } from '@components/ui/Avatar'
import { Skeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/common/EmptyState'
import toast from 'react-hot-toast'

interface PendingFarmer {
  id: string
  village: string
  district: string
  state: string
  experienceYears: number
  bio: string
  bankAccountNumber?: string
  ifscCode?: string
  user: { name: string; email: string; avatarUrl?: string; createdAt: string }
}

export default function AdminFarmersPage() {
  const queryClient = useQueryClient()

  const { data: farmers, isLoading } = useQuery({
    queryKey: ['admin', 'farmers', 'pending'],
    queryFn: () => adminService.pendingFarmers() as Promise<PendingFarmer[]>,
  })

  const verify = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      adminService.verifyFarmer(id, approve),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'farmers', 'pending'] })
      toast.success(vars.approve ? 'Farmer verified ✅' : 'Farmer rejected')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-medium text-gray-900">Farmer Verification</h1>
        <p className="text-sm text-gray-500 mt-0.5">Verify identity and bank details before farmers can list land</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : !farmers?.length ? (
        <EmptyState icon="✅" title="No pending verifications" description="All farmer profiles are reviewed." />
      ) : (
        <div className="space-y-3">
          {farmers.map((f) => (
            <div key={f.id} className="card p-4">
              <div className="flex items-start gap-3">
                <Avatar name={f.user.name} src={f.user.avatarUrl} size="lg" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{f.user.name}</p>
                  <p className="text-xs text-gray-500">{f.user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {f.village}, {f.district}, {f.state} · {f.experienceYears} years experience
                  </p>
                  {f.bio && <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg p-2">{f.bio}</p>}
                  {f.bankAccountNumber && (
                    <p className="text-xs text-gray-500 mt-2">
                      Bank: ****{f.bankAccountNumber.slice(-4)} · IFSC: {f.ifscCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <Button size="sm" variant="primary" loading={verify.isPending} onClick={() => verify.mutate({ id: f.id, approve: true })}>
                  ✅ Verify
                </Button>
                <Button size="sm" variant="destructive" loading={verify.isPending} onClick={() => verify.mutate({ id: f.id, approve: false })}>
                  ❌ Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
