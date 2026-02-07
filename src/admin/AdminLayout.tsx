import { NavLink, Outlet } from 'react-router'

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/items', label: 'Items' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/disputes', label: 'Disputes' },
  { to: '/admin/sources', label: 'Sources' },
]

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-neutral-950 text-white">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/10 bg-neutral-900 flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-wide">Admin</h1>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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

        <div className="px-3 py-4 border-t border-white/10">
          <NavLink
            to="/"
            className="block px-3 py-2 rounded-md text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            &larr; Back to Game
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
