import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  token!: string

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128)
  @Matches(/[A-Za-z]/, { message: 'Password must contain at least one letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  password!: string
}
