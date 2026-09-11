import { Leaf } from 'lucide-react'
import { useGoogleSignIn } from '@modules/auth/auth.hooks'

export default function GoogleLoginPage() {
  const googleSignIn = useGoogleSignIn()

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex w-[480px] flex-shrink-0 bg-brand-50 flex-col justify-between p-14">
        <div className="flex items-center gap-2.5">
          <Leaf className="w-6 h-6 text-brand-600" />
          <span className="font-serif text-2xl font-medium text-brand-800">Khetly</span>
        </div>

        <div>
          <h1 className="font-serif text-[40px] leading-[1.2] text-brand-900 mb-5">
            Rent real land.<br />Grow real food.
          </h1>
          <p className="text-brand-700 text-base leading-relaxed mb-10 max-w-[320px]">
            Connect directly with verified farmers near you. Choose your crop,
            track your yield — fresh produce at harvest.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '2,400+', label: 'Verified farmers' },
              { value: '8,000+', label: 'Active plots' },
              { value: '< 5 km', label: 'Avg distance' },
              { value: '40+', label: 'Crops available' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/70 rounded-xl p-4">
                <div className="text-xl font-semibold text-brand-600">{value}</div>
                <div className="text-sm text-brand-800 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-brand-600 opacity-60">
          Khetly — Empowering Indian farmers since 2024
        </p>
      </div>

      {/* Right panel — sign in */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-[360px] text-center">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-10 lg:hidden">
            <Leaf className="w-5 h-5 text-brand-600" />
            <span className="font-serif text-xl text-brand-800">Khetly</span>
          </div>

          <h2 className="text-2xl font-medium text-gray-900 mb-2">Welcome to Khetly</h2>
          <p className="text-sm text-gray-500 mb-10">
            Sign in with your Google account to get started — no passwords, no OTP.
          </p>

          <button
            onClick={() => googleSignIn.mutate()}
            disabled={googleSignIn.isPending}
            className="w-full h-13 flex items-center justify-center gap-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-60"
          >
            {googleSignIn.isPending ? (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {googleSignIn.isPending ? 'Signing in…' : 'Continue with Google'}
          </button>

          <p className="mt-8 text-xs text-gray-400 leading-relaxed">
            By continuing, you agree to Khetly's{' '}
            <a href="/terms" className="text-brand-600 hover:underline">Terms</a>{' '}
            and{' '}
            <a href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
