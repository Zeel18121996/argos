import { Controller, Post, Body, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { CheckoutService } from './checkout.service'
import { CreateCheckoutDto, VerifyCheckoutDto } from './dto/checkout.dto'
import { Public } from '../common/decorators/public.decorator'

const SESSION_COOKIE = 'argos_session'

@Controller('checkout')
@Public()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  /** Step 1: client posts address + delivery method, receives a Razorpay order to open the popup with. */
  @Post('create-payment')
  async createPayment(
    @Body() dto: CreateCheckoutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) _res: Response,
  ) {
    const { userId, sessionId } = this.resolveContext(req)
    return this.checkoutService.createPayment(userId, sessionId, dto)
  }

  /** Step 2: client posts the Razorpay payment response + address, server verifies and creates the DB order. */
  @Post('verify')
  async verify(
    @Body() dto: VerifyCheckoutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) _res: Response,
  ) {
    const { userId, sessionId } = this.resolveContext(req)
    const order = await this.checkoutService.verifyAndCreateOrder(userId, sessionId, dto)
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
    }
  }

  private resolveContext(req: Request): { userId: string | null; sessionId: string | null } {
    const user = (req as any).user
    const userId = user?.id ?? null
    const sessionId = userId ? null : (req.cookies?.[SESSION_COOKIE] ?? null)
    return { userId, sessionId }
  }
}
