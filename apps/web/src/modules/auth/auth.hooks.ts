import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from './auth.service'
import { useAuthStore } from './auth.store'
import { signInWithGoogle, firebaseSignOutUser } from '@lib/firebase'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

// ─── Google Sign-In ───────────────────────────────────────────────────────────
export function useGoogleSignIn(options?: { intent?: 'farmer' | 'renter'; returnTo?: string }) {
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const idToken = await signInWithGoogle()
      return authService.googleSignIn(idToken)
    },
    onSuccess: (response) => {
      const { user, tokens, needsProfileCompletion } = response

      if (!user || !tokens) {
        toast.error('Sign-in failed — unexpected response. Please try again.')
        return
      }

      setUser(user, tokens)
      queryClient.setQueryData(authKeys.me, user)

      if (needsProfileCompletion) {
        navigate('/complete-profile', {
          replace: true,
          state: {
            from: options?.returnTo
              ? { pathname: options.returnTo }
              : (location.state as { from?: unknown } | null)?.from,
            intent: options?.intent ?? (location.state as { intent?: 'farmer' | 'renter' } | null)?.intent,
          },
        })
        return
      }

      toast.success(`Welcome${user.name ? `, ${user.name}` : ''}! 🌾`)

      const returnPath = options?.returnTo
        ? { pathname: options.returnTo }
        : (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from
      if (returnPath?.pathname && returnPath.pathname !== '/login') {
        navigate(`${returnPath.pathname}${returnPath.search ?? ''}${returnPath.hash ?? ''}`, { replace: true })
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      } else if (user.role === 'FARMER') {
        navigate('/farmer/dashboard', { replace: true })
      } else {
        navigate('/explore', { replace: true })
      }
    },
    onError: (err: Error & { code?: string }) => {
      // User closing the Google popup shouldn't show a scary error
      if (err.message?.includes('popup-closed') || err.message?.includes('cancelled')) {
        return
      }
      toast.error(err.message ?? 'Google sign-in failed. Please try again.')
    },
  })
}

// ─── Complete profile (first-time role + name) ────────────────────────────────
export function useCompleteProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { role: 'RENTER' | 'FARMER'; name: string; preferredLanguage?: string }) =>
      authService.completeProfile(data),
    onSuccess: ({ user, tokens }) => {
      setUser(user, tokens)
      queryClient.setQueryData(authKeys.me, user)
      toast.success(`Welcome to Khetly, ${user.name}! 🌾`)

      if (user.role === 'FARMER') {
        navigate('/farmer/onboarding', { replace: true })
      } else if ((location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from?.pathname) {
        const from = (location.state as { from: { pathname: string; search?: string; hash?: string } }).from
        navigate(`${from.pathname}${from.search ?? ''}${from.hash ?? ''}`, { replace: true })
      } else {
        navigate('/explore', { replace: true })
      }
    },
    onError: (err: Error) => toast.error(err.message ?? 'Could not save profile.'),
  })
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await Promise.allSettled([authService.logout(), firebaseSignOutUser()])
    },
    onSettled: () => {
      logout()
      queryClient.clear()
      navigate('/login', { replace: true })
      toast.success('Logged out successfully')
    },
  })
}

// ─── Current user ─────────────────────────────────────────────────────────────
export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => authService.me(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
