import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { BasketController } from './basket.controller'
import { BasketService } from './basket.service'
import { BasketModel } from './models/basket.model'
import { BasketItemModel } from './models/basket-item.model'
import { ProductModel } from '../products/models/product.model'
import { ProductVariantModel } from '../products/models/product-variant.model'

@Module({
  imports: [
    SequelizeModule.forFeature([BasketModel, BasketItemModel, ProductModel, ProductVariantModel]),
  ],
  controllers: [BasketController],
  providers: [BasketService],
  exports: [BasketService],
})
export class BasketModule {}
