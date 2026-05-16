import type { UserRole } from '../../users/models/user.model'

/**
 * Shape of `request.user` after JwtStrategy validates a request.
 * Use this type everywhere with `@CurrentUser() user: JwtUser`.
 */
export interface JwtUser {
  id: string
  email: string
  role: UserRole
}

export interface JwtPayload {
  sub: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}
