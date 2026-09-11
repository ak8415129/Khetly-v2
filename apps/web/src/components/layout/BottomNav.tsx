import { NavLink } from 'react-router-dom'
import { Map, LayoutDashboard, CalendarDays, Bot, User, List, PlusSquare, Sprout } from 'lucide-react'
import { cn } from '@lib/utils'
import { useAuthStore } from '@modules/auth/auth.store'

const RENTER_TABS = [
  { to: '/explore', icon: Map, label: 'Explore' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/my-bookings', icon: CalendarDays, label: 'Bookings' },
  { to: '/ai-assistant', icon: Bot, label: 'AI' },
  { to: '/profile', icon: User, label: 'Profile' },
]

const FARMER_TABS = [
  { to: '/farmer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/farmer/listings', icon: List, label: 'Listings' },
  { to: '/farmer/listings/new', icon: PlusSquare, label: 'Add' },
  { to: '/farmer/bookings', icon: CalendarDays, label: 'Bookings' },
  { to: '/farmer/ai', icon: Sprout, label: 'AI' },
]

export function BottomNav() {
  const role = useAuthStore((s) => s.user?.role)
  const tabs = role === 'FARMER' ? FARMER_TABS : RENTER_TABS

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100 flex items-stretch h-16 safe-area-pb">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('w-5 h-5', isActive && 'text-brand-600')} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
