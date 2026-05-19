import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ListTree,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAppDispatch } from '@/app/store'
import { useLogoutMutation } from '@/services/authApi'
import { clearAuth } from '@/features/auth/authSlice'
import { baseApi } from '@/app/baseApi'
import { cn } from '@/utils/cn'

type NavItem = {
  to: string
  label: string
  icon: React.ComponentType<{ size?: number }>
  end?: boolean
}

const NAV: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/categories', label: 'Categories', icon: ListTree },
]

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/admin/products/new')) return 'New product'
  if (/^\/admin\/products\/.+\/edit$/.test(pathname)) return 'Edit product'
  if (pathname.startsWith('/admin/products')) return 'Products'
  if (pathname.startsWith('/admin/orders')) return 'Orders'
  if (pathname.startsWith('/admin/customers')) return 'Customers'
  if (pathname.startsWith('/admin/categories')) return 'Categories'
  return 'Dashboard'
}

function SidebarBrand() {
  return (
    <Link
      to="/admin/dashboard"
      className="h-14 flex items-center px-4 border-b border-argos-border focus-ring"
    >
      <span className="text-xl font-bold text-argos-red tracking-tight">argos</span>
      <span className="ml-2 text-2xs font-bold text-argos-gray bg-argos-gray-bg px-1.5 py-0.5 rounded uppercase tracking-wide">
        admin
      </span>
    </Link>
  )
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 py-4 px-3 space-y-1" aria-label="Admin navigation">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-bold transition-colors focus-ring',
              isActive ? 'bg-argos-red text-white' : 'text-argos-charcoal hover:bg-argos-gray-bg',
            )
          }
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarFooter({
  user,
  onSignOut,
  isSigningOut,
}: {
  user: ReturnType<typeof useAuth>['user']
  onSignOut: () => void
  isSigningOut: boolean
}) {
  return (
    <div className="p-3 border-t border-argos-border">
      <div className="px-3 py-2 text-xs text-argos-gray mb-2">
        <p className="font-bold text-argos-charcoal truncate">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="truncate">{user?.email}</p>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        disabled={isSigningOut}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-argos-gray hover:text-argos-red hover:bg-argos-red-light rounded transition-colors disabled:opacity-60 focus-ring"
      >
        <LogOut size={16} />
        {isSigningOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}

function Topbar({
  title,
  onOpenSidebar,
  user,
  isAdmin,
}: {
  title: string
  onOpenSidebar: () => void
  user: ReturnType<typeof useAuth>['user']
  isAdmin: boolean
}) {
  return (
    <header className="h-14 bg-white border-b border-argos-border flex items-center px-4 lg:px-6 sticky top-0 z-30">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="lg:hidden p-2 -ml-2 text-argos-charcoal hover:bg-argos-gray-bg rounded focus-ring"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <h1 className="text-base lg:text-lg font-bold text-argos-dark ml-2 lg:ml-0">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-argos-dark leading-tight truncate max-w-[160px]">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-2xs uppercase tracking-wide text-argos-gray leading-tight">
              {isAdmin ? 'Admin' : 'Staff'}
            </p>
          </div>
          <div
            className="w-8 h-8 rounded-full bg-argos-red text-white flex items-center justify-center text-xs font-bold"
            aria-hidden="true"
          >
            {(user?.firstName?.[0] ?? '?').toUpperCase()}
            {(user?.lastName?.[0] ?? '').toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}

export function AdminLayout() {
  const { user, isAdmin } = useAuth()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close mobile drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  // Close drawer on Escape
  useEffect(() => {
    if (!drawerOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [drawerOpen])

  const handleSignOut = async () => {
    try {
      await logout().unwrap()
    } catch {
      // server-side logout failure is non-fatal — still clear local state
    }
    dispatch(clearAuth())
    dispatch(baseApi.util.resetApiState())
    toast.success('Signed out')
    navigate('/')
  }

  const pageTitle = getPageTitle(location.pathname)

  return (
    <div className="min-h-screen flex bg-argos-gray-bg font-sans text-argos-charcoal">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-argos-border flex-shrink-0 flex-col sticky top-0 h-screen">
        <SidebarBrand />
        <SidebarNav />
        <SidebarFooter user={user} onSignOut={handleSignOut} isSigningOut={isLoggingOut} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            ref={drawerRef}
            className="relative w-64 bg-white flex flex-col shadow-xl animate-slide-in-left"
          >
            <div className="relative">
              <SidebarBrand />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-argos-charcoal hover:bg-argos-gray-bg rounded focus-ring"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
            <SidebarFooter user={user} onSignOut={handleSignOut} isSigningOut={isLoggingOut} />
          </aside>
        </div>
      )}

      {/* Main pane */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          title={pageTitle}
          onOpenSidebar={() => setDrawerOpen(true)}
          user={user}
          isAdmin={isAdmin}
        />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors closeButton duration={3000} />
    </div>
  )
}
