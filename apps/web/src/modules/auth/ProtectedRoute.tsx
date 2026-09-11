import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from './auth.store'
import { PageSpinner } from '@components/common/PageSpinner'
import type { UserRole } from '@khetly/types'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({ allowedRoles, redirectTo = '/login' }: ProtectedRouteProps) {
  const location = useLocation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const user = useAuthStore((s) => s.user)

  if (!isHydrated) return <PageSpinner />

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // First-time users must complete profile before accessing anything else
  if (!user.profileCompleted && user.role !== 'ADMIN' && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const home =
      user.role === 'ADMIN' ? '/admin/dashboard' :
      user.role === 'FARMER' ? '/farmer/dashboard' : '/explore'
    return <Navigate to={home} replace />
  }

  return <Outlet />
}

export function PublicOnlyRoute({ redirectTo }: { redirectTo?: string }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const user = useAuthStore((s) => s.user)

  if (!isHydrated) return <PageSpinner />

  if (isAuthenticated && user) {
    if (!user.profileCompleted && user.role !== 'ADMIN') {
      return <Navigate to="/complete-profile" replace />
    }
    const dest =
      redirectTo ??
      (user.role === 'ADMIN' ? '/admin/dashboard' :
       user.role === 'FARMER' ? '/farmer/dashboard' : '/explore')
    return <Navigate to={dest} replace />
  }

  return <Outlet />
}
