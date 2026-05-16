import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { UserModel } from '../users/models/user.model'
import { RefreshTokenModel } from '../auth/models/refresh-token.model'

@Module({
  imports: [SequelizeModule.forFeature([UserModel, RefreshTokenModel])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
