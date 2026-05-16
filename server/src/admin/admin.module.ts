import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { UserModel } from '../users/models/user.model'
import { RefreshTokenModel } from '../auth/models/refresh-token.model'
import { OrderModel } from '../orders/models/order.model'
import { ProductModel } from '../products/models/product.model'
import { CategoryModel } from '../categories/models/category.model'

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserModel,
      RefreshTokenModel,
      OrderModel,
      ProductModel,
      CategoryModel,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
