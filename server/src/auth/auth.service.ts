import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/sequelize'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { Op } from 'sequelize'
import { UsersService } from '../users/users.service'
import { UserModel, type UserRole } from '../users/models/user.model'
import { EmailService } from '../email/email.service'
import { RefreshTokenModel } from './models/refresh-token.model'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import type { JwtPayload } from './types/jwt-user.type'

const BCRYPT_ROUNDS = 12
const ACCESS_TOKEN_TTL = '24h'
const REFRESH_TOKEN_TTL_DAYS = 7

export interface AuthResultPayload {
  accessToken: string
  refreshToken: string // raw, sent in httpOnly cookie by controller
  user: ReturnType<UserModel['toPublicJSON']>
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    @InjectModel(RefreshTokenModel)
    private readonly refreshTokenModel: typeof RefreshTokenModel,
    @InjectModel(UserModel) private readonly userModel: typeof UserModel,
  ) {}

  // ── Register ──────────────────────────────────────────────────────────────
  async register(dto: RegisterDto, meta: { userAgent?: string; ip?: string }) {
    const exists = await this.usersService.existsByEmail(dto.email)
    if (exists) throw new ConflictException('Email already registered')

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS)

    const user = await this.userModel.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      marketingOptIn: dto.marketingOptIn ?? false,
      role: 'customer',
      isActive: true,
      emailVerified: false,
    } as Partial<UserModel>)

    return this.issueTokens(user, meta)
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  async login(dto: LoginDto, meta: { userAgent?: string; ip?: string }) {
    const user = await this.usersService.findByEmail(dto.email)
    // Same generic error for "no user" and "wrong password" to prevent enumeration.
    if (!user) throw new UnauthorizedException('Invalid email or password')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid email or password')

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated. Contact support.')
    }

    user.lastLoginAt = new Date()
    await user.save()

    return this.issueTokens(user, meta)
  }

  // ── Refresh (rotation) ────────────────────────────────────────────────────
  async refresh(rawRefreshToken: string, meta: { userAgent?: string; ip?: string }) {
    if (!rawRefreshToken) throw new UnauthorizedException('Missing refresh token')

    const tokenHash = this.hashToken(rawRefreshToken)
    const stored = await this.refreshTokenModel.findOne({
      where: { tokenHash, revoked: false, expiresAt: { [Op.gt]: new Date() } },
    })
    if (!stored) throw new UnauthorizedException('Invalid or expired refresh token')

    const user = await this.userModel.findByPk(stored.userId)
    if (!user || !user.isActive) throw new UnauthorizedException('Account not available')

    // Rotate: revoke the used token, issue a new pair.
    const result = await this.issueTokens(user, meta)
    stored.revoked = true
    await stored.save()
    return result
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return // idempotent
    const tokenHash = this.hashToken(rawRefreshToken)
    await this.refreshTokenModel.update({ revoked: true }, { where: { tokenHash, revoked: false } })
  }

  // ── Forgot password ───────────────────────────────────────────────────────
  /** Always returns silently (no enumeration). Sends reset email if user exists. */
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(dto.email)
    if (!user) return // pretend success

    const rawToken = crypto.randomBytes(32).toString('hex')
    user.passwordResetToken = this.hashToken(rawToken)
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1h
    await user.save()

    const clientUrl = this.config.get<string>('CLIENT_URL', 'http://localhost:3000')
    const resetUrl = `${clientUrl}/auth/reset-password?token=${rawToken}`
    await this.emailService.sendPasswordReset(user.email, resetUrl, user.firstName)
  }

  // ── Reset password ────────────────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = this.hashToken(dto.token)
    const user = await this.userModel.findOne({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpires: { [Op.gt]: new Date() },
      },
    })
    if (!user) throw new UnauthorizedException('Invalid or expired reset token')

    user.passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS)
    user.passwordResetToken = null
    user.passwordResetExpires = null
    await user.save()

    // Revoke all existing refresh tokens — force re-login everywhere.
    await this.refreshTokenModel.update(
      { revoked: true },
      { where: { userId: user.id, revoked: false } },
    )
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private async issueTokens(
    user: UserModel,
    meta: { userAgent?: string; ip?: string },
  ): Promise<AuthResultPayload> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role as UserRole }

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: ACCESS_TOKEN_TTL,
    })

    const refreshToken = crypto.randomBytes(48).toString('hex')
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
    await this.refreshTokenModel.create({
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt,
      userAgent: meta.userAgent ?? null,
      ipAddress: meta.ip ?? null,
    } as Partial<RefreshTokenModel>)

    return { accessToken, refreshToken, user: user.toPublicJSON() }
  }

  private hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex')
  }

  refreshTokenMaxAgeMs(): number {
    return REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  }
}
