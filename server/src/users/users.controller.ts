import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { UpdateMeDto } from './dto/update-me.dto'
import { CreateAddressDto } from './dto/create-address.dto'
import { UpdateAddressDto } from './dto/update-address.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { JwtUser } from '../auth/types/jwt-user.type'

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: JwtUser) {
    const full = await this.usersService.findById(user.id)
    return full.toPublicJSON()
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: JwtUser, @Body() dto: UpdateMeDto) {
    const updated = await this.usersService.updateMe(user.id, dto)
    return updated.toPublicJSON()
  }

  @Get('me/addresses')
  listAddresses(@CurrentUser() user: JwtUser) {
    return this.usersService.listAddresses(user.id)
  }

  @Post('me/addresses')
  createAddress(@CurrentUser() user: JwtUser, @Body() dto: CreateAddressDto) {
    return this.usersService.createAddress(user.id, dto)
  }

  @Patch('me/addresses/:id')
  updateAddress(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(user.id, addressId, dto)
  }

  @Delete('me/addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAddress(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) addressId: string) {
    await this.usersService.removeAddress(user.id, addressId)
  }
}
