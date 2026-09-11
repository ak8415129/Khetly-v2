import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, IndianRupee, MapPin, Users } from 'lucide-react'
import { adminService } from '@modules/admin/admin.service'
import { BookingStatusBadge } from '@components/ui/Badge'
import { EmptyState } from '@components/common/EmptyState'
import { Skeleton } from '@components/ui/Skeleton'
import { formatDate, formatINR } from '@khetly/utils'
import type { BookingStatus } from '@khetly/types'

interface AdminBooking {
  id: string
  status: BookingStatus
  startDate: string
  endDate: string
  durationMonths: number
  totalAmount: number
  platformFee: number
  createdAt: string
  listing: { title: string }
  renter: { name: string; email: string }
  farmer: { user: { name: string; email: string } }
}

interface AdminBookingsResponse {
  data: AdminBooking[]
  total: number
  totalPages: number
}

type BookingView = 'active' | 'completed' | 'all'

export default function AdminBookingsPage() {
  const [view, setView] = useState<BookingView>('active')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: () => adminService.allBookings({ page: 1 }) as unknown as Promise<AdminBookingsResponse>,
  })

  const bookings = data?.data ?? []
  const activeBookings = useMemo(
    () => bookings.filter((booking) => ['CONFIRMED', 'ACTIVE'].includes(booking.status)),
    [bookings]
  )
  const completedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'COMPLETED'),
    [bookings]
  )
  const visibleBookings = view === 'active'
    ? activeBookings
    : view === 'completed'
      ? completedBookings
      : bookings

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-600">Platform oversight</p>
        <h1 className="mt-1 text-2xl font-medium text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor active rentals and completed transactions.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard icon={<CalendarDays className="h-4 w-4" />} label="All bookings" value={data?.total ?? 0} />
        <SummaryCard icon={<Users className="h-4 w-4" />} label="Active" value={activeBookings.length} tone="green" />
        <SummaryCard icon={<IndianRupee className="h-4 w-4" />} label="Completed" value={completedBookings.length} tone="amber" />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
        {[
          { value: 'active' as const, label: `Active (${activeBookings.length})` },
          { value: 'completed' as const, label: `Completed (${completedBookings.length})` },
          { value: 'all' as const, label: `All (${data?.total ?? 0})` },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setView(tab.value)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${view === tab.value ? 'bg-brand-50 text-brand-800' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, index) => <Skeleton key={index} className="h-36 rounded-xl" />)}</div>
      ) : isError ? (
        <EmptyState icon="⚠️" title="Could not load bookings" description="Check the API connection and try again." />
      ) : visibleBookings.length === 0 ? (
        <EmptyState
          icon="📋"
          title={view === 'active' ? 'No active bookings' : view === 'completed' ? 'No completed bookings' : 'No bookings yet'}
          description="Bookings will appear here when renters enquire about a listing."
        />
      ) : (
        <div className="space-y-3">
          {visibleBookings.map((booking) => <BookingRow key={booking.id} booking={booking} />)}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon, label, value, tone = 'blue' }: { icon: React.ReactNode; label: string; value: number; tone?: 'blue' | 'green' | 'amber' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function BookingRow({ booking }: { booking: AdminBooking }) {
  return (
    <div className="card space-y-4 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-medium text-gray-900">{booking.listing.title}</h2>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            Rental period: {formatDate(booking.startDate)} to {formatDate(booking.endDate)} ({booking.durationMonths} months)
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-gray-500">Total booking value</p>
          <p className="text-base font-semibold text-brand-700">{formatINR(booking.totalAmount)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-3 text-sm sm:grid-cols-3">
        <Person label="Renter" name={booking.renter.name || 'Unnamed renter'} email={booking.renter.email} />
        <Person label="Farmer" name={booking.farmer.user.name || 'Unnamed farmer'} email={booking.farmer.user.email} />
        <div>
          <p className="text-xs text-gray-500">Platform fee</p>
          <p className="mt-1 font-medium text-gray-800">{formatINR(booking.platformFee)}</p>
          <p className="mt-0.5 text-xs text-gray-400">Created {formatDate(booking.createdAt)}</p>
        </div>
      </div>
    </div>
  )
}

function Person({ label, name, email }: { label: string; name: string; email: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 truncate font-medium text-gray-800">{name}</p>
      <p className="truncate text-xs text-gray-400">{email}</p>
    </div>
  )
}