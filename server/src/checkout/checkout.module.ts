import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { CheckoutController } from './checkout.controller'
import { CheckoutService } from './checkout.service'
import { BasketModule } from '../basket/basket.module'
import { PaymentsModule } from '../payments/payments.module'
import { OrdersModule } from '../orders/orders.module'
import { UsersModule } from '../users/users.module'
import { ProductModel } from '../products/models/product.model'
import { ProductVariantModel } from '../products/models/product-variant.model'

@Module({
  imports: [
    SequelizeModule.forFeature([ProductModel, ProductVariantModel]),
    BasketModule,
    PaymentsModule,
    OrdersModule,
    UsersModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
