import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import { WishlistService } from './wishlist.service'
import { AddWishlistItemDto } from './dto/wishlist.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async find(@Req() req: Request) {
    const userId = (req as any).user.id
    const items = await this.wishlistService.getWishlist(userId)
    return this.wishlistService.toResponse(items)
  }

  @Post('items')
  async add(@Body() dto: AddWishlistItemDto, @Req() req: Request) {
    const userId = (req as any).user.id
    await this.wishlistService.addItem(userId, dto.productId)
    const items = await this.wishlistService.getWishlist(userId)
    return this.wishlistService.toResponse(items)
  }

  @Delete('items/:productId')
  async remove(@Param('productId', ParseUUIDPipe) productId: string, @Req() req: Request) {
    const userId = (req as any).user.id
    await this.wishlistService.removeItem(userId, productId)
    const items = await this.wishlistService.getWishlist(userId)
    return this.wishlistService.toResponse(items)
  }
}
