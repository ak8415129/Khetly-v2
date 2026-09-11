import { useQuery } from '@tanstack/react-query'
import { Users, Tractor, MapPin, CalendarDays, IndianRupee, Clock } from 'lucide-react'
import { adminService } from '@modules/admin/admin.service'
import { DashboardStatsSkeleton } from '@components/ui/Skeleton'
import { formatINR } from '@khetly/utils'
import { useNavigate } from 'react-router-dom'
import { Button } from '@components/ui/Button'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminService.getStats(),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform-wide overview</p>
      </div>

      {isLoading || !stats ? (
        <DashboardStatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total users', value: stats.totalUsers, color: 'text-blue-600 bg-blue-50' },
            { icon: Tractor, label: 'Farmers', value: stats.totalFarmers, color: 'text-brand-600 bg-brand-50' },
            { icon: Users, label: 'Renters', value: stats.totalRenters, color: 'text-purple-600 bg-purple-50' },
            { icon: MapPin, label: 'Active listings', value: stats.activeListings, color: 'text-brand-600 bg-brand-50' },
            { icon: Clock, label: 'Pending review', value: stats.pendingListings, color: 'text-amber-600 bg-amber-50' },
            { icon: CalendarDays, label: 'Total bookings', value: stats.totalBookings, color: 'text-blue-600 bg-blue-50' },
            { icon: CalendarDays, label: 'Completed', value: stats.completedBookings, color: 'text-green-600 bg-green-50' },
            { icon: IndianRupee, label: 'Platform revenue', value: formatINR(stats.platformRevenue), color: 'text-amber-600 bg-amber-50' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-xl font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-900 mb-3">Needs your attention</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/admin/listings')}>
            📋 Review pending listings {stats?.pendingListings ? `(${stats.pendingListings})` : ''}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/admin/farmers')}>
            👨‍🌾 Verify farmers
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
            👥 Manage users
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/audit-log')}>
            📜 Audit log
          </Button>
        </div>
      </div>
    </div>
  )
}
