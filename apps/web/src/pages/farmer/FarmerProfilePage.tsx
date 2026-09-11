import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Star, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient } from '@lib/api-client'
import { useAuthStore } from '@modules/auth/auth.store'
import { useLogout } from '@modules/auth/auth.hooks'
import { Input, Textarea } from '@components/ui/Input'
import { Button } from '@components/ui/Button'
import { Avatar } from '@components/ui/Avatar'
import { VerifiedBadge } from '@components/ui/Badge'
import { Skeleton } from '@components/ui/Skeleton'
import type { FarmerProfile } from '@khetly/types'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  village: z.string().min(2, 'Required'),
  tehsil: z.string().min(2, 'Required'),
  district: z.string().min(2, 'Required'),
  state: z.string().min(2, 'Required'),
  experienceYears: z.coerce.number().min(0),
})
type Form = z.infer<typeof schema>

function useFarmerProfile() {
  return useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: () =>
      apiClient.get('/farmer/profile') as Promise<
        FarmerProfile & { user: { name: string; email: string } }
      >,
  })
}

export default function FarmerProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const logout = useLogout()
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useFarmerProfile()

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    values: {
      name: user?.name ?? '',
      bio: profile?.bio ?? '',
      village: profile?.village ?? '',
      tehsil: profile?.tehsil ?? '',
      district: profile?.district ?? '',
      state: profile?.state ?? '',
      experienceYears: profile?.experienceYears ?? 0,
    },
  })

  const update = useMutation({
    mutationFn: (data: Form) => apiClient.patch('/farmer/profile', data) as Promise<FarmerProfile>,
    onSuccess: (_, data) => {
      updateUser({ name: data.name })
      queryClient.invalidateQueries({ queryKey: ['farmer', 'profile'] })
      toast.success('Profile updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (isLoading) return (
    <div className="max-w-lg mx-auto space-y-4">
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-medium text-gray-900">My Profile</h1>

      <div className="card p-5">
        <div className="flex items-center gap-4 mb-4">
          <Avatar name={user?.name || user?.email || 'F'} src={user?.avatarUrl} size="xl" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-gray-900 text-lg">{user?.name || 'Set your name'}</p>
              {profile && <VerifiedBadge status={profile.verificationStatus} />}
            </div>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {profile?.rating > 0 && (
              <div className="flex items-center gap-1 mt-1 text-amber-600 text-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                <span className="font-medium">{profile.rating.toFixed(1)}</span>
                <span className="text-gray-400 text-xs">({profile.reviewCount} reviews)</span>
              </div>
            )}
          </div>
        </div>

        {profile?.verificationStatus !== 'VERIFIED' && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Verification pending</p>
              <p className="text-xs mt-0.5">Our team is reviewing your documents. Usually 24 hours.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Listings', value: profile?.totalListings ?? 0 },
            { label: 'Bookings', value: profile?.activeBookings ?? 0 },
            { label: 'Experience', value: `${profile?.experienceYears ?? 0}y` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-lg font-semibold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Edit profile</h2>
        <form onSubmit={handleSubmit((d) => update.mutate(d))} className="space-y-4">
          <Input label="Full name" error={errors.name?.message} {...register('name')} />
          <Textarea label="Bio" placeholder="Tell renters about yourself and your farming experience..." error={errors.bio?.message} {...register('bio')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Village" error={errors.village?.message} {...register('village')} />
            <Input label="Tehsil" error={errors.tehsil?.message} {...register('tehsil')} />
            <Input label="District" error={errors.district?.message} {...register('district')} />
            <Input label="State" error={errors.state?.message} {...register('state')} />
            <Input label="Experience (years)" type="number" error={errors.experienceYears?.message} {...register('experienceYears')} />
          </div>
          <Button type="submit" variant="primary" fullWidth loading={update.isPending}>Save changes</Button>
        </form>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-medium text-gray-900 mb-3">Account</h2>
        <Button variant="destructive" fullWidth loading={logout.isPending} onClick={() => logout.mutate()}>
          Log out
        </Button>
      </div>
    </div>
  )
}
