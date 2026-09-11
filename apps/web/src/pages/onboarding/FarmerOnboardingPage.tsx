import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Leaf, CheckCircle } from 'lucide-react'
import { apiClient } from '@lib/api-client'
import { useAuthStore } from '@modules/auth/auth.store'
import { Input, Textarea, Select } from '@components/ui/Input'
import { Button } from '@components/ui/Button'
import { cn } from '@lib/utils'

// ─── Step schemas ──────────────────────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().min(2, 'Full name required'),
  bio: z.string().min(10, 'Tell renters about yourself (min 10 chars)'),
  village: z.string().min(2, 'Village required'),
  tehsil: z.string().min(2, 'Tehsil required'),
  district: z.string().min(2, 'District required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().length(6, '6-digit pincode required'),
  experienceYears: z.coerce.number().min(0).max(60),
})

const step2Schema = z.object({
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Enter 12-digit Aadhaar number'),
})

const step3Schema = z.object({
  accountHolderName: z.string().min(2, 'Account holder name required'),
  bankAccountNumber: z.string().min(9, 'Enter valid account number'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter valid IFSC code (e.g. SBIN0001234)'),
  upiId: z.string().optional(),
})

type Step1Form = z.infer<typeof step1Schema>
type Step2Form = z.infer<typeof step2Schema>
type Step3Form = z.infer<typeof step3Schema>

const STEPS = [
  { number: 1, label: 'Profile' },
  { number: 2, label: 'Aadhaar' },
  { number: 3, label: 'Bank' },
  { number: 4, label: 'Done' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function FarmerOnboardingPage() {
  const [step, setStep] = useState(1)
  const navigate = useNavigate()
  const updateUser = useAuthStore((s) => s.updateUser)

  const profileMutation = useMutation({
    mutationFn: (data: Step1Form) => apiClient.patch('/farmer/profile', data) as Promise<unknown>,
    onSuccess: () => { updateUser({ name: profileForm.getValues('name') }); setStep(2) },
    onError: (err: Error) => toast.error(err.message),
  })

  const aadhaarMutation = useMutation({
    mutationFn: (data: Step2Form) => apiClient.patch('/farmer/profile', { aadhaarNumber: data.aadhaarNumber }) as Promise<unknown>,
    onSuccess: () => setStep(3),
    onError: (err: Error) => toast.error(err.message),
  })

  const bankMutation = useMutation({
    mutationFn: (data: Step3Form) => apiClient.patch('/farmer/profile', data) as Promise<unknown>,
    onSuccess: () => setStep(4),
    onError: (err: Error) => toast.error(err.message),
  })

  const profileForm = useForm<Step1Form>({ resolver: zodResolver(step1Schema), defaultValues: { experienceYears: 0 } })
  const aadhaarForm = useForm<Step2Form>({ resolver: zodResolver(step2Schema) })
  const bankForm = useForm<Step3Form>({ resolver: zodResolver(step3Schema) })

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-card overflow-hidden">
        {/* Header */}
        <div className="bg-brand-600 px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-5 h-5 text-brand-200" />
            <span className="font-serif text-lg text-white">Khetly</span>
          </div>
          <h1 className="text-xl font-medium text-white mb-1">Farmer onboarding</h1>
          <p className="text-brand-200 text-sm">Complete your profile to start listing land</p>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-5">
            {STEPS.map((s, i) => (
              <div key={s.number} className="flex items-center gap-2">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2',
                  step > s.number ? 'bg-white border-white text-brand-600'
                    : step === s.number ? 'bg-transparent border-white text-white'
                    : 'bg-transparent border-brand-400 text-brand-400'
                )}>
                  {step > s.number ? <CheckCircle className="w-4 h-4" /> : s.number}
                </div>
                <span className={cn('text-xs hidden sm:inline', step >= s.number ? 'text-white' : 'text-brand-400')}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <div className={cn('flex-1 h-px w-6', step > s.number ? 'bg-white' : 'bg-brand-500')} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="p-8">
          {step === 1 && (
            <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} className="space-y-4">
              <h2 className="text-base font-medium text-gray-900 mb-4">Tell us about yourself</h2>
              <Input label="Full name" placeholder="Ramesh Kumar" error={profileForm.formState.errors.name?.message} {...profileForm.register('name')} />
              <Textarea label="Bio" placeholder="Third-generation wheat farmer from Sohna, practicing organic methods since 2015..." error={profileForm.formState.errors.bio?.message} {...profileForm.register('bio')} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Village" placeholder="Sohna" error={profileForm.formState.errors.village?.message} {...profileForm.register('village')} />
                <Input label="Tehsil" placeholder="Sohna" error={profileForm.formState.errors.tehsil?.message} {...profileForm.register('tehsil')} />
                <Input label="District" placeholder="Gurugram" error={profileForm.formState.errors.district?.message} {...profileForm.register('district')} />
                <Input label="State" placeholder="Haryana" error={profileForm.formState.errors.state?.message} {...profileForm.register('state')} />
                <Input label="Pincode" placeholder="122103" maxLength={6} error={profileForm.formState.errors.pincode?.message} {...profileForm.register('pincode')} />
                <Input label="Experience (years)" type="number" placeholder="10" error={profileForm.formState.errors.experienceYears?.message} {...profileForm.register('experienceYears')} />
              </div>
              <Button type="submit" variant="primary" fullWidth loading={profileMutation.isPending}>Continue →</Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={aadhaarForm.handleSubmit((d) => aadhaarMutation.mutate(d))} className="space-y-4">
              <h2 className="text-base font-medium text-gray-900 mb-1">Aadhaar verification</h2>
              <p className="text-sm text-gray-500 mb-4">Required to verify your identity and list land on Khetly.</p>
              <Input
                label="Aadhaar number"
                placeholder="1234 5678 9012"
                maxLength={12}
                inputMode="numeric"
                hint="12-digit Aadhaar number — your data is encrypted"
                error={aadhaarForm.formState.errors.aadhaarNumber?.message}
                {...aadhaarForm.register('aadhaarNumber')}
              />
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                ⚠️ Your Aadhaar is used only for identity verification. We never share it with renters.
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" variant="primary" fullWidth loading={aadhaarMutation.isPending}>Verify & Continue →</Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={bankForm.handleSubmit((d) => bankMutation.mutate(d))} className="space-y-4">
              <h2 className="text-base font-medium text-gray-900 mb-1">Bank account for payouts</h2>
              <p className="text-sm text-gray-500 mb-4">Your earnings will be transferred here within 7 days of booking confirmation.</p>
              <Input label="Account holder name" placeholder="Ramesh Kumar" error={bankForm.formState.errors.accountHolderName?.message} {...bankForm.register('accountHolderName')} />
              <Input label="Account number" placeholder="012345678901" inputMode="numeric" error={bankForm.formState.errors.bankAccountNumber?.message} {...bankForm.register('bankAccountNumber')} />
              <Input label="IFSC code" placeholder="SBIN0001234" style={{ textTransform: 'uppercase' }} hint="Find on your cheque book or bank passbook" error={bankForm.formState.errors.ifscCode?.message} {...bankForm.register('ifscCode')} />
              <Input label="UPI ID (optional)" placeholder="ramesh@upi" error={bankForm.formState.errors.upiId?.message} {...bankForm.register('upiId')} />
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button type="submit" variant="primary" fullWidth loading={bankMutation.isPending}>Submit & Finish →</Button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-brand-600" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">You're all set! 🌾</h2>
              <p className="text-sm text-gray-500 mb-6">
                Your profile is under review. You can start creating listings now — they'll go live once verified (usually within 24 hours).
              </p>
              <div className="bg-brand-50 rounded-xl p-4 text-left mb-6 space-y-2">
                <p className="text-xs font-medium text-brand-800">What happens next:</p>
                <p className="text-xs text-brand-700">✅ Profile submitted for review</p>
                <p className="text-xs text-brand-700">📋 Create your first listing</p>
                <p className="text-xs text-brand-700">🎉 Listing goes live after approval</p>
                <p className="text-xs text-brand-700">💰 Earn from your first renter</p>
              </div>
              <Button variant="primary" fullWidth onClick={() => navigate('/farmer/dashboard', { replace: true })}>
                Go to dashboard →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
