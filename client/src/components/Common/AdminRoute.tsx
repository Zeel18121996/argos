import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAppSelector } from '@/app/store'

interface Props {
  children: React.ReactNode
}

/** Admin-only — staff and customers redirect away. */
export function AdminRoute({ children }: Props) {
  const { isAuthenticated, isAdmin } = useAuth()
  const isBootstrapping = useAppSelector((s) => s.auth.status === 'loading')
  const location = useLocation()

  if (isBootstrapping) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-argos-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/auth/login?successUrl=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    )
  }

  // Staff lands on the admin home if they try to access an admin-only sub-route.
  if (!isAdmin) return <Navigate to="/admin" replace />

  return <>{children}</>
}
