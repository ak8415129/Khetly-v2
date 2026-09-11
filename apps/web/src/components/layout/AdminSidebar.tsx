import { NavLink } from 'react-router-dom'
import { Leaf, LayoutDashboard, Users, MapPin, Tractor, CalendarDays, ScrollText, LogOut } from 'lucide-react'
import { cn } from '@lib/utils'
import { useAuthStore } from '@modules/auth/auth.store'
import { useLogout } from '@modules/auth/auth.hooks'
import { Avatar } from '@components/ui/Avatar'

const ADMIN_NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/listings', icon: MapPin, label: 'Pending Listings' },
  { to: '/admin/farmers', icon: Tractor, label: 'Farmer Verification' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/bookings', icon: CalendarDays, label: 'Bookings' },
  { to: '/admin/audit-log', icon: ScrollText, label: 'Audit Log' },
]

export function AdminSidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-gray-900 text-white z-30">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-gray-800">
        <Leaf className="w-5 h-5 text-brand-400" />
        <span className="font-serif text-xl font-medium">Khetly</span>
        <span className="ml-auto text-[10px] font-medium bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">
          Admin
        </span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {ADMIN_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="border-t border-gray-800 p-3">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Avatar name={user.name} src={user.avatarUrl} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      )}
    </aside>
  )
}
