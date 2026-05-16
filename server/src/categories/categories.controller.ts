import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { Public } from '../common/decorators/public.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /** Full nested category tree — used by the MegaMenu */
  @Get()
  @Public()
  findTree() {
    return this.categoriesService.findTree()
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id)
  }
}
