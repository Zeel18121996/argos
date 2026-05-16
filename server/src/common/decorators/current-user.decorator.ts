import { createParamDecorator, ExecutionContext } from '@nestjs/common'

/** Extracts the authenticated user from the request (set by JwtStrategy). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<{ user: unknown }>().user,
)
