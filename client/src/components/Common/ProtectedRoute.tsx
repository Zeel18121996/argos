import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAppSelector } from '@/app/store'

interface Props {
  children: React.ReactNode
}

/** Requires any authenticated user (customer, staff, or admin). */
export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuth()
  const isBootstrapping = useAppSelector((s) => s.auth.status === 'loading')
  const location = useLocation()

  // Wait for bootstrap (initial /users/me call) before deciding.
  if (isBootstrapping) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-argos-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Send unauthenticated users to login, remember where they were going.
    return (
      <Navigate
        to={`/auth/login?successUrl=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    )
  }

  return <>{children}</>
}
