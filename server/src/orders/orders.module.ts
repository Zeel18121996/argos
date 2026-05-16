import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { OrderModel } from './models/order.model'
import { OrderItemModel } from './models/order-item.model'
import { ProductModel } from '../products/models/product.model'
import { ProductVariantModel } from '../products/models/product-variant.model'

@Module({
  imports: [
    SequelizeModule.forFeature([OrderModel, OrderItemModel, ProductModel, ProductVariantModel]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
