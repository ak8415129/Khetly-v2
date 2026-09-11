import { Check, Leaf, Tractor } from 'lucide-react'
import { Modal } from '@components/ui/Modal'
import { useGoogleSignIn } from '@modules/auth/auth.hooks'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  intent?: 'farmer' | 'renter'
  returnTo?: string
}

export function AuthModal({ open, onClose, intent = 'renter', returnTo }: AuthModalProps) {
  const googleSignIn = useGoogleSignIn({ intent, returnTo })
  const isFarmer = intent === 'farmer'

  return (
    <Modal open={open} onClose={onClose} size="sm" showClose>
      <div className="-mt-1">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          {isFarmer ? <Tractor className="h-5 w-5" /> : <Leaf className="h-5 w-5" />}
        </div>
        <h2 className="text-2xl font-medium tracking-tight text-gray-900">
          {isFarmer ? 'List your land with Khetly' : 'Continue to enquire'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          {isFarmer
            ? 'Create your farmer profile and start building a trusted listing.'
            : 'Sign in to message the farmer and manage your enquiry. Browsing remains open.'}
        </p>

        <div className="mt-5 space-y-2.5 text-xs text-gray-600">
          {['One secure Google sign-in', isFarmer ? 'Guided farmer setup' : 'Your enquiry stays in one place'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Check className="h-2.5 w-2.5" />
              </span>
              {item}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => googleSignIn.mutate()}
          disabled={googleSignIn.isPending}
          className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:opacity-60"
        >
          {googleSignIn.isPending ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          ) : (
            <GoogleIcon />
          )}
          {googleSignIn.isPending ? 'Opening Google…' : 'Continue with Google'}
        </button>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-gray-400">
          No password or OTP required. By continuing, you agree to Khetly's Terms and Privacy Policy.
        </p>
      </div>
    </Modal>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}