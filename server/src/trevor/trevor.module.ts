import { Module } from '@nestjs/common'
import { TrevorController } from './trevor.controller'
import { TrevorService } from './trevor.service'
import { ProductsModule } from '../products/products.module'

@Module({
  imports: [ProductsModule],
  controllers: [TrevorController],
  providers: [TrevorService],
})
export class TrevorModule {}
