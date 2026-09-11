import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from '@modules/auth/ProtectedRoute'
import { AppShell } from '@components/layout/AppShell'
import { AdminShell } from '@components/layout/AdminShell'
import { PageSpinner } from '@components/common/PageSpinner'
import { ErrorBoundary } from '@components/common/ErrorBoundary'

// Auth & onboarding
const GoogleLoginPage = lazy(() => import('@pages/auth/GoogleLoginPage'))
const CompleteProfilePage = lazy(() => import('@pages/onboarding/CompleteProfilePage'))
const FarmerOnboardingPage = lazy(() => import('@pages/onboarding/FarmerOnboardingPage'))

// Renter pages
const ExplorePage = lazy(() => import('@pages/user/ExplorePage'))
const ListingDetailPage = lazy(() => import('@pages/user/ListingDetailPage'))
const BookingsPage = lazy(() => import('@pages/user/BookingsPage'))
const ProfilePage = lazy(() => import('@pages/user/ProfilePage'))
const AiChatPage = lazy(() => import('@pages/user/AiChatPage'))
const RenterDashboard = lazy(() => import('@pages/dashboard/RenterDashboard'))

// Farmer pages
const FarmerDashboard = lazy(() => import('@pages/farmer/FarmerDashboard'))
const FarmerListingsPage = lazy(() => import('@pages/farmer/FarmerListingsPage'))
const CreateListingPage = lazy(() => import('@pages/farmer/CreateListingPage'))
const EditListingPage = lazy(() => import('@pages/farmer/EditListingPage'))
const FarmerBookingsPage = lazy(() => import('@pages/farmer/FarmerBookingsPage'))
const FarmerProfilePage = lazy(() => import('@pages/farmer/FarmerProfilePage'))
const FarmerAiPage = lazy(() => import('@pages/farmer/FarmerAiPage'))

// Admin pages
const AdminDashboard = lazy(() => import('@pages/admin/AdminDashboard'))
const AdminListingsPage = lazy(() => import('@pages/admin/AdminListingsPage'))
const AdminFarmersPage = lazy(() => import('@pages/admin/AdminFarmersPage'))
const AdminUsersPage = lazy(() => import('@pages/admin/AdminUsersPage'))

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          {/* ── Public — redirect away if already logged in ── */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<GoogleLoginPage />} />
          </Route>

          {/* ── Public discovery — visitors can browse before signing in ── */}
          <Route element={<AppShell />}>
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
          </Route>

          {/* ── Profile completion — any authenticated user, profile not yet done ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/complete-profile" element={<CompleteProfilePage />} />
            <Route path="/farmer/onboarding" element={<FarmerOnboardingPage />} />
          </Route>

          {/* ── Renter routes ── */}
          <Route element={<ProtectedRoute allowedRoles={['RENTER']} />}>
            <Route element={<AppShell />}>
              <Route path="/my-bookings" element={<BookingsPage />} />
              <Route path="/dashboard" element={<RenterDashboard />} />
              <Route path="/ai-assistant" element={<AiChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* ── Farmer routes ── */}
          <Route element={<ProtectedRoute allowedRoles={['FARMER']} />}>
            <Route element={<AppShell />}>
              <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
              <Route path="/farmer/listings" element={<FarmerListingsPage />} />
              <Route path="/farmer/listings/new" element={<CreateListingPage />} />
              <Route path="/farmer/listings/:id/edit" element={<EditListingPage />} />
              <Route path="/farmer/bookings" element={<FarmerBookingsPage />} />
              <Route path="/farmer/ai" element={<FarmerAiPage />} />
              <Route path="/farmer/profile" element={<FarmerProfilePage />} />
            </Route>
          </Route>

          {/* ── Admin routes ── */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminShell />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/listings" element={<AdminListingsPage />} />
              <Route path="/admin/farmers" element={<AdminFarmersPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/bookings" element={<div className="p-4 text-gray-500">Bookings oversight — coming soon</div>} />
              <Route path="/admin/audit-log" element={<div className="p-4 text-gray-500">Audit log — coming soon</div>} />
            </Route>
          </Route>

          {/* ── Fallback ── */}
          <Route path="/" element={<Navigate to="/explore" replace />} />
          <Route path="*" element={<Navigate to="/explore" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
