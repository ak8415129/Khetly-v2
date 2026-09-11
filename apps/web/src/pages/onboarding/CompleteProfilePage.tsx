import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Leaf, User, Tractor } from 'lucide-react'
import { useCompleteProfile } from '@modules/auth/auth.hooks'
import { useAuthStore } from '@modules/auth/auth.store'
import { Input } from '@components/ui/Input'
import { Button } from '@components/ui/Button'
import { Avatar } from '@components/ui/Avatar'
import { cn } from '@lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  preferredLanguage: z.enum(['en', 'hi']),
})
type Form = z.infer<typeof schema>

export default function CompleteProfilePage() {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const loginIntent = (location.state as { intent?: 'farmer' | 'renter' } | null)?.intent
  const [role, setRole] = useState<'RENTER' | 'FARMER'>(loginIntent === 'farmer' ? 'FARMER' : 'RENTER')
  const completeProfile = useCompleteProfile()

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', preferredLanguage: 'en' },
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-8">
        <div className="flex items-center gap-2 mb-6">
          <Leaf className="w-6 h-6 text-brand-600" />
          <span className="font-serif text-xl text-brand-800">Khetly</span>
        </div>

        {/* Google profile preview */}
        {user && (
          <div className="flex items-center gap-3 mb-6 bg-gray-50 rounded-xl p-3">
            <Avatar name={user.name || user.email || 'User'} src={user.avatarUrl} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'Google User'}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <h1 className="text-xl font-medium text-gray-900 mb-1">One last step</h1>
        <p className="text-sm text-gray-500 mb-6">Tell us how you'll use Khetly.</p>

        {/* Role selector */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            I am a
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('RENTER')}
              className={cn(
                'flex flex-col items-start p-3 rounded-xl border text-sm transition-all',
                role === 'RENTER' ? 'bg-brand-50 border-brand-400 text-brand-800' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              <User className="w-5 h-5 mb-1" />
              <span className="font-medium">Renter</span>
              <span className="text-xs text-gray-500 mt-0.5">I want to rent farmland</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('FARMER')}
              className={cn(
                'flex flex-col items-start p-3 rounded-xl border text-sm transition-all',
                role === 'FARMER' ? 'bg-brand-50 border-brand-400 text-brand-800' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              <Tractor className="w-5 h-5 mb-1" />
              <span className="font-medium">Farmer</span>
              <span className="text-xs text-gray-500 mt-0.5">I want to list my land</span>
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit((d) => completeProfile.mutate({ ...d, role }))}
          className="space-y-4"
        >
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

          <Button type="submit" variant="primary" fullWidth loading={completeProfile.isPending}>
            Continue →
          </Button>
        </form>
      </div>
    </div>
  )
}
