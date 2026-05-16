import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName?: string

  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName?: string

  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  phone?: string

  @IsOptional()
  @IsBoolean()
  marketingOptIn?: boolean
}
