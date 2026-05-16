import { Controller, Post, Body } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { ProcessPaymentDto } from './dto/payment.dto'

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('charge')
  async charge(@Body() dto: ProcessPaymentDto) {
    return this.paymentsService.charge(dto)
  }
}
