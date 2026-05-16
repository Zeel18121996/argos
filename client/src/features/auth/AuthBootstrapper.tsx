import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { setAuth, setAuthLoading, clearAuth } from './authSlice'
import { useRefreshMutation } from '@/services/authApi'

/**
 * Mounted once at app root. On first load, calls /auth/refresh to see if the
 * user has a still-valid httpOnly refresh cookie from a previous session.
 *
 * - Success → stores accessToken + user in Redux.
 * - 401     → clears any stale state (silently — anonymous users land at /).
 */
export function AuthBootstrapper() {
  const dispatch = useAppDispatch()
  const ranRef = useRef(false)
  const status = useAppSelector((s) => s.auth.status)
  const [refresh] = useRefreshMutation()

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    // Only attempt bootstrap if we don't already have an in-memory session.
    if (status === 'succeeded') return

    dispatch(setAuthLoading())
    refresh()
      .unwrap()
      .then((result) => {
        dispatch(setAuth({ user: result.user, accessToken: result.accessToken }))
      })
      .catch(() => {
        dispatch(clearAuth())
      })
    // Intentionally only runs once — refresh + dispatch are stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
