import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class LoginDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(320)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email!: string

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(128)
  password!: string
}
