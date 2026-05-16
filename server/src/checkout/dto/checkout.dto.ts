import { IsString, IsNotEmpty, IsOptional, IsIn, Length } from 'class-validator'

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  line1: string

  @IsOptional()
  @IsString()
  line2?: string

  @IsString()
  @IsNotEmpty()
  city: string

  @IsString()
  @IsNotEmpty()
  postcode: string

  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  email?: string

  @IsIn(['standard', 'next_day', 'click_collect'])
  deliveryMethod: string

  @IsString()
  @IsNotEmpty()
  cardNumber: string

  @IsString()
  @IsNotEmpty()
  @Length(5, 5)
  expiry: string

  @IsString()
  @IsNotEmpty()
  @Length(3, 4)
  cvc: string
}
