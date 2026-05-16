import { Transform } from 'class-transformer'
import { IsEmail, MaxLength } from 'class-validator'

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(320)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email!: string
}
