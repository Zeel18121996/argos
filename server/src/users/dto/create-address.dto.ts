import { Transform } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator'

export class CreateAddressDto {
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  line1!: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  line2?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  postcode!: string

  @IsOptional()
  @IsString()
  @Length(2, 2, { message: 'Country must be a 2-letter ISO code' })
  country?: string

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string
}
