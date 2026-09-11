import { useLocation } from 'react-router-dom'
import { Leaf, Bell } from 'lucide-react'
import { useAuthStore } from '@modules/auth/auth.store'
import { Avatar } from '@components/ui/Avatar'
import { NavLink } from 'react-router-dom'

const PAGE_TITLES: Record<string, string> = {
  '/explore': 'Explore',
  '/dashboard': 'Dashboard',
  '/my-bookings': 'My Bookings',
  '/ai-assistant': 'AI Assistant',
  '/profile': 'Profile',
  '/farmer/dashboard': 'Dashboard',
  '/farmer/listings': 'My Listings',
  '/farmer/listings/new': 'New Listing',
  '/farmer/bookings': 'Bookings',
  '/farmer/ai': 'Farming AI',
  '/farmer/profile': 'Profile',
}

export function TopNav() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)

  const title =
    PAGE_TITLES[location.pathname] ??
    (location.pathname.includes('/listings/') ? 'Listing' : 'Khetly')

  const profilePath = user?.role === 'FARMER' ? '/farmer/profile' : '/profile'

  return (
    <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Leaf className="w-4 h-4 text-brand-600" />
        <span className="font-medium text-gray-900">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 relative">
          <Bell className="w-5 h-5" />
          {/* Unread dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {user && (
          <NavLink to={profilePath}>
            <Avatar
              name={user.name || user.email}
              src={user.avatarUrl}
              size="sm"
              className="cursor-pointer"
            />
          </NavLink>
        )}
      </div>
    </header>
  )
}
