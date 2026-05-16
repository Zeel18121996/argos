import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ThrottlerGuard, Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { Public } from '../common/decorators/public.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'

const REFRESH_COOKIE = 'argos_refresh'

@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  // ── Public endpoints ──────────────────────────────────────────────────────

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 300_000 } }) // 5 / 5 min
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto, this.metaFromReq(req))
    this.setRefreshCookie(res, result.refreshToken)
    return { accessToken: result.accessToken, user: result.user }
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, this.metaFromReq(req))
    this.setRefreshCookie(res, result.refreshToken)
    return { accessToken: result.accessToken, user: result.user }
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = (req.cookies?.[REFRESH_COOKIE] as string) ?? ''
    const result = await this.authService.refresh(raw, this.metaFromReq(req))
    this.setRefreshCookie(res, result.refreshToken)
    return { accessToken: result.accessToken, user: result.user }
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = (req.cookies?.[REFRESH_COOKIE] as string) ?? ''
    await this.authService.logout(raw)
    this.clearRefreshCookie(res)
    return { ok: true }
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 900_000 } }) // 3 / 15 min
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgot(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto)
    return { ok: true }
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async reset(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto)
    return { ok: true }
  }

  // ── Cookie + meta helpers ─────────────────────────────────────────────────
  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: this.authService.refreshTokenMaxAgeMs(),
      path: '/api/v1/auth',
    })
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' })
  }

  private metaFromReq(req: Request): { userAgent?: string; ip?: string } {
    return {
      userAgent: req.headers['user-agent']?.toString().slice(0, 255),
      ip: req.ip?.toString().slice(0, 64),
    }
  }
}
