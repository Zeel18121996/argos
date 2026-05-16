import { useAppSelector } from '@/app/store'

export function useAuth() {
  const user = useAppSelector((s) => s.auth.user)
  const accessToken = useAppSelector((s) => s.auth.accessToken)

  return {
    user,
    accessToken,
    isAuthenticated: !!user,
    isStaff: user?.role === 'staff' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
  }
}
