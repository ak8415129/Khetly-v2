import { NavLink } from 'react-router-dom'
import {
  Leaf, LayoutDashboard, Map, CalendarDays, User, List,
  PlusSquare, Sprout, LogOut, Bot,
} from 'lucide-react'
import { cn } from '@lib/utils'
import { useAuthStore } from '@modules/auth/auth.store'
import { useLogout } from '@modules/auth/auth.hooks'
import { Avatar } from '@components/ui/Avatar'

interface NavItem { to: string; icon: React.ReactNode; label: string }

const RENTER_NAV: NavItem[] = [
  { to: '/explore', icon: <Map className="w-5 h-5" />, label: 'Explore' },
  { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/my-bookings', icon: <CalendarDays className="w-5 h-5" />, label: 'My Bookings' },
  { to: '/ai-assistant', icon: <Bot className="w-5 h-5" />, label: 'AI Assistant' },
  { to: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
]

const FARMER_NAV: NavItem[] = [
  { to: '/farmer/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/farmer/listings', icon: <List className="w-5 h-5" />, label: 'My Listings' },
  { to: '/farmer/listings/new', icon: <PlusSquare className="w-5 h-5" />, label: 'Add Listing' },
  { to: '/farmer/bookings', icon: <CalendarDays className="w-5 h-5" />, label: 'Bookings' },
  { to: '/farmer/ai', icon: <Sprout className="w-5 h-5" />, label: 'Farming AI' },
  { to: '/farmer/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
]

const PUBLIC_NAV: NavItem[] = [
  { to: '/explore', icon: <Map className="w-5 h-5" />, label: 'Explore farmland' },
]

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const isFarmer = user?.role === 'FARMER'
  const navItems = !user ? PUBLIC_NAV : isFarmer ? FARMER_NAV : RENTER_NAV

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-white border-r border-gray-100 z-30">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-gray-100">
        <Leaf className="w-5 h-5 text-brand-600" />
        <span className="font-serif text-xl font-medium text-brand-800">Khetly</span>
        {isFarmer && (
          <span className="ml-auto text-[10px] font-medium bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
            Farmer
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
        {!user && (
          <NavLink
            to="/explore?auth=farmer"
            state={{ intent: 'farmer' }}
            className="mt-4 flex items-center justify-center rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-brand-800 transition-colors"
          >
            Rent land as a farmer
          </NavLink>
        )}
      </nav>

      {user && (
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <Avatar name={user.name || user.email} src={user.avatarUrl} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'Set your name'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {logout.isPending ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      )}
    </aside>
  )
}

function SidebarLink({ to, icon, label }: NavItem) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}
