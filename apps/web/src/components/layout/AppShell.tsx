import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'

/**
 * Main app shell after login.
 * Desktop: fixed sidebar (left) + main content
 * Mobile: top nav + scrollable content + bottom tab bar
 */
export function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Desktop sidebar ── */}
      <Sidebar />

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Top nav — mobile only */}
        <TopNav />

        <main className="flex-1 px-4 py-5 lg:px-8 lg:py-7 pb-24 lg:pb-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <BottomNav />
    </div>
  )
}
