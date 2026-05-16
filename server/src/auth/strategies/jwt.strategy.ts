import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersService } from '../../users/users.service'
import type { JwtPayload, JwtUser } from '../types/jwt-user.type'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET') ?? '',
    })
  }

  /**
   * Runs on every authenticated request. Returns the user shape that
   * gets attached to `request.user` (consumed by @CurrentUser()).
   */
  async validate(payload: JwtPayload): Promise<JwtUser> {
    const user = await this.usersService.findByEmail(payload.email)
    if (!user || user.id !== payload.sub) throw new UnauthorizedException()
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated')
    return { id: user.id, email: user.email, role: user.role }
  }
}
