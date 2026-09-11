import { ArrowLeft, Check, Leaf, Tractor } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useGoogleSignIn } from '@modules/auth/auth.hooks'

export default function GoogleLoginPage() {
  const googleSignIn = useGoogleSignIn()
  const location = useLocation()
  const state = location.state as { intent?: 'farmer' | 'renter'; from?: unknown } | null
  const isFarmerIntent = state?.intent === 'farmer'
  const backPath = (state?.from as { pathname?: string } | undefined)?.pathname ?? '/explore'

  return (
    <div className="min-h-screen bg-[#f7f8f3] px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(36,55,29,0.12)]">
        <div className="hidden w-[46%] flex-col justify-between bg-brand-800 p-12 text-white lg:flex">
          <Link to={backPath} className="flex items-center gap-2.5 text-white">
            <Leaf className="h-6 w-6 text-brand-200" />
            <span className="font-serif text-2xl font-medium">Khetly</span>
          </Link>

          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-brand-200">
              {isFarmerIntent ? 'For landowners' : 'For modern growers'}
            </p>
            <h1 className="max-w-md font-serif text-5xl leading-[1.08]">
              {isFarmerIntent ? 'Turn your land into opportunity.' : 'Rent real land. Grow real food.'}
            </h1>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-brand-100">
              {isFarmerIntent
                ? 'Create a trusted listing, meet serious renters, and grow your farm income with Khetly.'
                : 'Discover verified farmland near you and plan your next growing season with confidence.'}
            </p>
            <div className="mt-10 space-y-3 text-sm text-brand-100">
              {['Google sign-in in one step', 'Verified farmer network', 'Clear rental details'].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-brand-200">Khetly · Better land access for everyone</p>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">
          <Link to={backPath} className="mb-12 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> Back to listings
          </Link>

          <div className="mb-10 flex items-center gap-2 lg:hidden">
            <Leaf className="h-5 w-5 text-brand-600" />
            <span className="font-serif text-xl text-brand-800">Khetly</span>
          </div>

          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            {isFarmerIntent ? <Tractor className="h-6 w-6" /> : <Leaf className="h-6 w-6" />}
          </div>
          <h2 className="text-3xl font-medium tracking-tight text-gray-900">
            {isFarmerIntent ? 'Start renting out your land' : 'Welcome to Khetly'}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500">
            {isFarmerIntent
              ? 'Sign in to begin your farmer profile and listing setup. It only takes a few minutes.'
              : 'Sign in to send enquiries and manage your farmland journey. Browsing stays open to everyone.'}
          </p>

          <button
            onClick={() => googleSignIn.mutate()}
            disabled={googleSignIn.isPending}
            className="mt-8 flex h-13 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:opacity-60"
          >
            {googleSignIn.isPending ? (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {googleSignIn.isPending ? 'Signing in…' : 'Continue with Google'}
          </button>

          <p className="mt-8 text-xs leading-relaxed text-gray-400">
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
