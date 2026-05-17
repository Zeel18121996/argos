import { Module } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { RazorpayProvider } from './razorpay.provider'

@Module({
  providers: [PaymentsService, RazorpayProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
