import { IsString, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator'

export class ProcessPaymentDto {
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

  @IsOptional()
  @IsString()
  amount?: string
}
