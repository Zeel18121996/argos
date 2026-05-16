import { Controller, Post, Body, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { CheckoutService } from './checkout.service'
import { CheckoutDto } from './dto/checkout.dto'
import { Public } from '../common/decorators/public.decorator'

const SESSION_COOKIE = 'argos_session'

@Controller('checkout')
@Public()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  async checkout(
    @Body() dto: CheckoutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = (req as any).user
    const userId = user?.id ?? null
    const sessionId = userId ? null : (req.cookies?.[SESSION_COOKIE] ?? null)
    const order = await this.checkoutService.checkout(userId, sessionId, dto)
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
    }
  }
}
