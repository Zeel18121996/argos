import { Module } from '@nestjs/common'
import { CheckoutController } from './checkout.controller'
import { CheckoutService } from './checkout.service'
import { BasketModule } from '../basket/basket.module'
import { PaymentsModule } from '../payments/payments.module'
import { OrdersModule } from '../orders/orders.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [BasketModule, PaymentsModule, OrdersModule, UsersModule],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
