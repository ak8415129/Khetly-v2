import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { adminService } from '@modules/admin/admin.service'
import { Avatar } from '@components/ui/Avatar'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Skeleton } from '@components/ui/Skeleton'
import { Modal } from '@components/ui/Modal'
import { Textarea } from '@components/ui/Input'
import toast from 'react-hot-toast'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  avatarUrl?: string
  isActive: boolean
  createdAt: string
  farmerProfile?: { verificationStatus: string }
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null)
  const [reason, setReason] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', search, roleFilter],
    queryFn: () => adminService.listUsers({ search, role: roleFilter || undefined }) as Promise<{ data: AdminUser[]; total: number }>,
  })

  const suspend = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminService.suspendUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User suspended')
      setSuspendTarget(null)
      setReason('')
    },
  })

  const reactivate = useMutation({
    mutationFn: (id: string) => adminService.reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User reactivated')
    },
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-medium text-gray-900">Manage Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} total users</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-base w-40">
          <option value="">All roles</option>
          <option value="RENTER">Renters</option>
          <option value="FARMER">Farmers</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {data?.data.map((u) => (
            <div key={u.id} className="card p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={u.name || u.email} src={u.avatarUrl} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.name || 'No name'}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={u.role === 'ADMIN' ? 'info' : u.role === 'FARMER' ? 'success' : 'neutral'}>
                  {u.role}
                </Badge>
                {!u.isActive && <Badge variant="danger">Suspended</Badge>}

                {u.role !== 'ADMIN' && (
                  u.isActive ? (
                    <Button size="sm" variant="outline" onClick={() => setSuspendTarget(u)}>Suspend</Button>
                  ) : (
                    <Button size="sm" variant="secondary" loading={reactivate.isPending} onClick={() => reactivate.mutate(u.id)}>
                      Reactivate
                    </Button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        title="Suspend user"
        description={`${suspendTarget?.name} will lose access immediately.`}
        size="sm"
      >
        <Textarea placeholder="Reason for suspension…" value={reason} onChange={(e) => setReason(e.target.value)} />
        <Modal.Footer>
          <Button variant="outline" onClick={() => setSuspendTarget(null)}>Cancel</Button>
          <Button
            variant="destructive"
            loading={suspend.isPending}
            onClick={() => suspendTarget && suspend.mutate({ id: suspendTarget.id, reason })}
          >
            Suspend
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
