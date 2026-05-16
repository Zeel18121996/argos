import { Injectable, BadRequestException } from '@nestjs/common'
import { BasketService } from '../basket/basket.service'
import { PaymentsService } from '../payments/payments.service'
import { OrdersService } from '../orders/orders.service'
import { EmailService } from '../email/email.service'
import { UsersService } from '../users/users.service'
import { CheckoutDto } from './dto/checkout.dto'
import type { OrderModel } from '../orders/models/order.model'

@Injectable()
export class CheckoutService {
  constructor(
    private readonly basketService: BasketService,
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  /** One-shot checkout: address + payment in one request.
   *  Creates order, clears basket, sends email.
   */
  async checkout(
    userId: string | null,
    sessionId: string | null,
    dto: CheckoutDto,
  ): Promise<OrderModel> {
    let basket: any
    if (userId) {
      basket = await this.basketService.getOrCreateUserBasket(userId)
    } else if (sessionId) {
      basket = await this.basketService.getOrCreateGuestBasket(sessionId)
    } else {
      throw new BadRequestException('No session or user provided')
    }

    if (!basket.items || basket.items.length === 0) {
      throw new BadRequestException('Basket is empty')
    }

    const deliveryCost = this.getDeliveryCost(dto.deliveryMethod)

    // Process payment
    const paymentResult = await this.paymentsService.charge({
      cardNumber: dto.cardNumber,
      expiry: dto.expiry,
      cvc: dto.cvc,
    })

    if (paymentResult.status === 'failed') {
      throw new BadRequestException(paymentResult.message ?? 'Payment failed')
    }

    // Snapshot basket items
    const basketItems = basket.items.map((item: any) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }))

    // Create order
    const order = await this.ordersService.createFromBasket(
      userId,
      dto.email ?? null,
      basketItems,
      {
        line1: dto.line1,
        line2: dto.line2 ?? null,
        city: dto.city,
        postcode: dto.postcode,
        firstName: dto.firstName ?? null,
        lastName: dto.lastName ?? null,
        phone: dto.phone ?? null,
        country: 'GB',
      },
      dto.deliveryMethod,
      deliveryCost,
      paymentResult.paymentIntentId,
    )

    // Clear basket
    await this.basketService.clearBasket(basket.id)

    // Send confirmation email
    const recipientEmail =
      dto.email ?? (userId ? (await this.usersService.findById(userId)).email : null)
    if (recipientEmail) {
      await this.emailService.sendOrderConfirmation(
        recipientEmail,
        order.orderNumber,
        order.total,
        basketItems.reduce((sum: number, i: any) => sum + i.quantity, 0),
      )
    }

    return order
  }

  private getDeliveryCost(method: string): number {
    switch (method) {
      case 'next_day':
        return 695 // £6.95
      case 'click_collect':
        return 0
      default:
        return 395 // £3.95 standard
    }
  }
}
