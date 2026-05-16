import { Controller, Get, Param, Query } from '@nestjs/common'
import { ProductsService } from './products.service'
import { QueryProductsDto } from './dto/query-products.dto'
import { Public } from '../common/decorators/public.decorator'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /** Public list */
  @Get()
  @Public()
  findAllPublic(@Query() query: QueryProductsDto) {
    return this.productsService.findAllPublic(query)
  }

  /** Public detail */
  @Get(':slug')
  @Public()
  findOnePublic(@Param('slug') slug: string) {
    return this.productsService.findOnePublic(slug)
  }
}
