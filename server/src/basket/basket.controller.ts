import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { BasketService } from './basket.service'
import { AddBasketItemDto, UpdateBasketItemDto, MergeBasketDto } from './dto/basket.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { v4 as uuidv4 } from 'uuid'

const SESSION_COOKIE = 'argos_session'
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days

function getOrSetSessionId(req: Request, res: Response): string {
  const existing = req.cookies?.[SESSION_COOKIE]
  if (existing) return existing
  const sessionId = uuidv4().replace(/-/g, '')
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    sameSite: 'lax',
    secure: false, // set true in production with HTTPS
  })
  return sessionId
}

@Controller('basket')
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  /** Get current basket (guest or authenticated). */
  @Get()
  async find(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = (req as any).user
    if (user?.id) {
      const basket = await this.basketService.getOrCreateUserBasket(user.id)
      return this.basketService.toResponse(basket)
    }
    const sessionId = getOrSetSessionId(req, res)
    const basket = await this.basketService.getOrCreateGuestBasket(sessionId)
    return this.basketService.toResponse(basket)
  }

  /** Add item to basket. */
  @Post('items')
  async addItem(
    @Body() dto: AddBasketItemDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = (req as any).user
    let basket: any
    if (user?.id) {
      basket = await this.basketService.getOrCreateUserBasket(user.id)
    } else {
      const sessionId = getOrSetSessionId(req, res)
      basket = await this.basketService.getOrCreateGuestBasket(sessionId)
    }
    await this.basketService.addItem(basket.id, dto.productId, dto.quantity, dto.variantId)
    const refreshed = user?.id
      ? await this.basketService.getOrCreateUserBasket(user.id)
      : await this.basketService.getOrCreateGuestBasket(basket.sessionId)
    return this.basketService.toResponse(refreshed)
  }

  /** Update item quantity. */
  @Patch('items/:id')
  async updateItem(
    @Param('id', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateBasketItemDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.basketService.updateItem(itemId, dto.quantity)
    return this.find(req, res)
  }

  /** Remove item from basket. */
  @Delete('items/:id')
  async removeItem(
    @Param('id', ParseUUIDPipe) itemId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.basketService.removeItem(itemId)
    return this.find(req, res)
  }

  /** Clear all items. */
  @Delete()
  async clear(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = (req as any).user
    let basket: any
    if (user?.id) {
      basket = await this.basketService.getOrCreateUserBasket(user.id)
    } else {
      const sessionId = getOrSetSessionId(req, res)
      basket = await this.basketService.getOrCreateGuestBasket(sessionId)
    }
    await this.basketService.clearBasket(basket.id)
    return this.find(req, res)
  }

  /** Merge guest basket into user basket (called on login). */
  @Post('merge')
  @UseGuards(JwtAuthGuard)
  async merge(@Body() dto: MergeBasketDto, @Req() req: Request) {
    const userId = (req as any).user.id
    const sessionId = dto.guestSessionId ?? req.cookies?.[SESSION_COOKIE]
    if (!sessionId)
      return this.basketService.toResponse(await this.basketService.getOrCreateUserBasket(userId))
    const basket = await this.basketService.mergeGuestIntoUser(sessionId, userId)
    return this.basketService.toResponse(basket)
  }
}
