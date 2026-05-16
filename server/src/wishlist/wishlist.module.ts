import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { WishlistController } from './wishlist.controller'
import { WishlistService } from './wishlist.service'
import { WishlistItemModel } from './models/wishlist-item.model'
import { ProductModel } from '../products/models/product.model'

@Module({
  imports: [SequelizeModule.forFeature([WishlistItemModel, ProductModel])],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
