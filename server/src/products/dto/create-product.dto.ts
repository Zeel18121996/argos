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

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  name: string

  @IsString()
  @MinLength(2)
  @MaxLength(220)
  slug: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  sku: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsUUID('4')
  categoryId: string

  @IsInt()
  @Min(0)
  price: number

  @IsOptional()
  @IsInt()
  @Min(0)
  compareAtPrice?: number

  @IsInt()
  @Min(0)
  stockCount: number = 0

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
  isActive?: boolean = true

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false

  @IsOptional()
  @IsBoolean()
  isOnOffer?: boolean = false

  @IsOptional()
  @IsBoolean()
  isNew?: boolean = false

  @IsOptional()
  @IsBoolean()
  isClearance?: boolean = false

  @IsOptional()
  @IsBoolean()
  isBigDeal?: boolean = false

  @IsOptional()
  @IsBoolean()
  reserveAvailable?: boolean = false
}
