import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { useAuth, useUser, SignIn, UserButton } from '@clerk/clerk-react'
import { useIsMobile } from '@/hooks/useIsMobile'

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/items', label: 'Items' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/disputes', label: 'Disputes' },
  { to: '/admin/sources', label: 'Sources' },
]

export function AdminLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <p className="text-white/50">Loading…</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <SignIn routing="hash" />
      </div>
    )
  }

  if (user?.publicMetadata?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-white/50">You do not have admin privileges.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-neutral-950 text-white">
      {/* Mobile header bar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-wide">Admin</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white/60"
            aria-label="Toggle menu"
            style={{ background: 'none', border: 'none', fontSize: '20px' }}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>
      )}

      {/* Backdrop for mobile sidebar */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${isMobile ? 'fixed top-0 left-0 z-50 h-full' : ''} w-60 shrink-0 border-r border-white/10 bg-neutral-900 flex flex-col`}
        style={{
          ...(isMobile ? {
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.2s ease',
          } : {}),
        }}
      >
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-wide">Admin</h1>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-3">
            <UserButton afterSignOutUrl={import.meta.env.BASE_URL + 'admin'} />
            <span className="text-sm text-white/50">Account</span>
          </div>
          <NavLink
            to="/"
            className="block px-3 py-2 rounded-md text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            &larr; Back to Game
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1" style={{ padding: isMobile ? '64px 16px 16px' : '32px' }}>
        <Outlet />
      </main>
    </div>
  )
}
