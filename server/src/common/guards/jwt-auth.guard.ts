import { Injectable, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }

  /**
   * For @Public() routes: allow guest access ONLY when no Authorization
   * header was sent at all.  If an expired/invalid token was sent, we
   * still throw 401 so the frontend's silent-refresh interceptor can
   * rotate and retry.
   */
  handleRequest(err: Error, user: any, info: any, context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    const req = context.switchToHttp().getRequest()
    const hasAuthHeader = !!req.headers?.authorization

    // No auth header at all → genuine guest on a public route
    if (isPublic && !hasAuthHeader && !user) {
      return null
    }

    return super.handleRequest(err, user, info, context)
  }
}
