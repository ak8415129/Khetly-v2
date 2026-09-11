import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '@lib/api-client'
import { useAuthStore } from '@modules/auth/auth.store'
import { useLogout } from '@modules/auth/auth.hooks'
import { Input } from '@components/ui/Input'
import { Button } from '@components/ui/Button'
import { Avatar } from '@components/ui/Avatar'
import type { AuthUser } from '@khetly/types'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  preferredLanguage: z.enum(['en', 'hi']),
})
type Form = z.infer<typeof schema>

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const logout = useLogout()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', preferredLanguage: user?.preferredLanguage ?? 'en' },
  })

  const update = useMutation({
    mutationFn: (data: Form) => apiClient.patch('/users/me', data) as Promise<AuthUser>,
    onSuccess: (updated) => {
      updateUser(updated)
      queryClient.setQueryData(['auth', 'me'], updated)
      toast.success('Profile updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (!user) return null

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-medium text-gray-900">My Profile</h1>

      <div className="card p-5 flex items-center gap-4">
        <Avatar name={user.name || user.email} src={user.avatarUrl} size="xl" />
        <div>
          <p className="font-medium text-gray-900">{user.name || 'Set your name'}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
            {user.role.toLowerCase()}
          </span>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Edit details</h2>
        <form onSubmit={handleSubmit((d) => update.mutate(d))} className="space-y-4">
          <Input label="Full name" placeholder="Ramesh Kumar" error={errors.name?.message} {...register('name')} />
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Preferred language
            </label>
            <select className="input-base" {...register('preferredLanguage')}>
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>
          <Button type="submit" variant="primary" fullWidth loading={update.isPending}>
            Save changes
          </Button>
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
