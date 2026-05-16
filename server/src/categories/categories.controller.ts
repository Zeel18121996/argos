import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { Public } from '../common/decorators/public.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto'

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

  @Post()
  @Roles('staff')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto)
  }

  @Patch(':id')
  @Roles('staff')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto)
  }

  @Delete(':id')
  @Roles('staff')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.deactivate(id)
  }
}
