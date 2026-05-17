import { IsString, IsNotEmpty, IsOptional, IsIn, IsEmail } from 'class-validator'

export class CreateCheckoutDto {
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
  @IsEmail()
  email?: string

  @IsIn(['standard', 'next_day', 'click_collect'])
  deliveryMethod: string
}

export class VerifyCheckoutDto extends CreateCheckoutDto {
  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string

  @IsString()
  @IsNotEmpty()
  razorpayPaymentId: string

  @IsString()
  @IsNotEmpty()
  razorpaySignature: string
}
