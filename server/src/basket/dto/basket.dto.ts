import { IsUUID, IsInt, Min, IsOptional, IsString } from 'class-validator'

export class AddBasketItemDto {
  @IsString()
  productId: string

  @IsOptional()
  @IsUUID()
  variantId?: string

  @IsInt()
  @Min(1)
  quantity: number = 1
}

export class UpdateBasketItemDto {
  @IsInt()
  @Min(1)
  quantity: number
}

export class MergeBasketDto {
  @IsOptional()
  @IsString()
  guestSessionId?: string
}
