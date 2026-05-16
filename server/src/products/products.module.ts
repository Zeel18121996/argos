import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { ProductsController } from './products.controller'
import { AdminProductsController } from './admin-products.controller'
import { ProductsService } from './products.service'
import { ProductModel } from './models/product.model'
import { ProductImageModel } from './models/product-image.model'
import { ProductVariantModel } from './models/product-variant.model'
import { CategoriesModule } from '../categories/categories.module'

@Module({
  imports: [
    SequelizeModule.forFeature([ProductModel, ProductImageModel, ProductVariantModel]),
    CategoriesModule,
  ],
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
