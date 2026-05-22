import { Injectable } from '@nestjs/common'
import { ProductsService } from '../products/products.service'
import { ProductSort } from '../products/dto/query-products.dto'
import { QuerySearchDto } from './dto/query-search.dto'

@Injectable()
export class SearchService {
  constructor(private readonly productsService: ProductsService) {}

  async search(query: QuerySearchDto) {
    return this.productsService.findAllPublic({
      q: query.q,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy ?? ProductSort.relevance,
    })
  }
}
