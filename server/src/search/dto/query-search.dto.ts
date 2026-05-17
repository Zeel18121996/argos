import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { ProductSort } from '../../products/dto/query-products.dto'

export class QuerySearchDto {
  @IsString()
  @MaxLength(300)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  q: string

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
  limit?: number = 24

  @IsOptional()
  @IsEnum(ProductSort)
  sortBy?: ProductSort
}
