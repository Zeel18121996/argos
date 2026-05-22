import { IsOptional, IsInt, Min, Max, IsString, IsIn, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'

export class QueryOrderDto {
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
  status?: string

  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @IsString()
  from?: string

  @IsOptional()
  @IsString()
  to?: string
}

export class AdminQueryOrderDto extends QueryOrderDto {}

export class UpdateOrderStatusDto {
  @IsIn([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'refunded',
  ])
  next: string

  @IsOptional()
  @IsString()
  trackingNumber?: string

  @IsOptional()
  @IsString()
  note?: string
}
