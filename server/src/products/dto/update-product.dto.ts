import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  name?: string

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(220)
  slug?: string

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  sku?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUUID('4')
  categoryId?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  compareAtPrice?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  stockCount?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[]

  @IsOptional()
  @IsArray()
  specifications?: Array<{ name: string; value: string }>

  @IsOptional()
  @IsArray()
  deliveryOptions?: Array<{ type: string; label: string; price: number; availableFrom?: string }>

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean

  @IsOptional()
  @IsBoolean()
  isOnOffer?: boolean

  @IsOptional()
  @IsBoolean()
  isNew?: boolean

  @IsOptional()
  @IsBoolean()
  isClearance?: boolean

  @IsOptional()
  @IsBoolean()
  isBigDeal?: boolean

  @IsOptional()
  @IsBoolean()
  reserveAvailable?: boolean
}
