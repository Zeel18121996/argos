import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UserModel } from './models/user.model'
import { AddressModel } from './models/address.model'

@Module({
  imports: [SequelizeModule.forFeature([UserModel, AddressModel])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
