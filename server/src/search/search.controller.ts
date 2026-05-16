import { Controller, Get, Query } from '@nestjs/common'
import { SearchService } from './search.service'
import { QuerySearchDto } from './dto/query-search.dto'
import { Public } from '../common/decorators/public.decorator'

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  search(@Query() query: QuerySearchDto) {
    return this.searchService.search(query)
  }
}
