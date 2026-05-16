import { Transform, Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

export enum UserStatusFilter {
  active = 'active',
  deactivated = 'deactivated',
}

export enum UserRoleFilter {
  customer = 'customer',
  staff = 'staff',
  admin = 'admin',
}

export class QueryUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 30

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  q?: string

  @IsOptional()
  @IsEnum(UserRoleFilter)
  role?: UserRoleFilter

  @IsOptional()
  @IsEnum(UserStatusFilter)
  status?: UserStatusFilter
}
