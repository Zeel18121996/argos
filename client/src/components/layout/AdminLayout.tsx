import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ListTree,
  ChevronLeft,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/categories', label: 'Categories', icon: ListTree },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex bg-argos-gray-bg">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-argos-border flex-shrink-0 flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-argos-border">
          <span className="text-xl font-bold text-argos-red tracking-tight">argos</span>
          <span className="ml-2 text-xs font-bold text-argos-gray bg-argos-gray-bg px-1.5 py-0.5 rounded">
            admin
          </span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-argos-red text-white'
                    : 'text-argos-charcoal hover:bg-argos-gray-bg'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-argos-border">
          <div className="px-3 py-2 text-xs text-argos-gray mb-2">
            <p className="font-bold text-argos-charcoal">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-argos-gray hover:text-argos-red hover:bg-red-50 rounded transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-argos-gray hover:text-argos-charcoal hover:bg-argos-gray-bg rounded transition-colors mt-1"
          >
            <ChevronLeft size={16} />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
