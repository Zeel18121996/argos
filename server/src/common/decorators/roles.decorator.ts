import { SetMetadata } from '@nestjs/common'

export type UserRole = 'customer' | 'staff' | 'admin'

export const ROLES_KEY = 'roles'

/**
 * Restrict a route to specific roles (hierarchy-based).
 * @Roles('staff') allows staff AND admin.
 * @Roles('admin') allows admin only.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
