import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY, type UserRole } from '../decorators/roles.decorator'

/** Numeric level per role — higher = more permissions */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  customer: 0,
  staff: 1,
  admin: 2,
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // No @Roles() → any authenticated user passes (JwtAuthGuard already verified)
    if (!requiredRoles || requiredRoles.length === 0) return true

    const { user } = context.switchToHttp().getRequest<{ user?: { role: UserRole } }>()
    if (!user) return false

    const userLevel = ROLE_HIERARCHY[user.role] ?? -1
    const minRequired = Math.min(...requiredRoles.map((r) => ROLE_HIERARCHY[r] ?? 99))

    return userLevel >= minRequired
  }
}
