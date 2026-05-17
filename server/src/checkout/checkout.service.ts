import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { BasketService } from '../basket/basket.service'
import { PaymentsService, CreateOrderResult } from '../payments/payments.service'
import { OrdersService } from '../orders/orders.service'
import { EmailService } from '../email/email.service'
import { UsersService } from '../users/users.service'
import { CreateCheckoutDto, VerifyCheckoutDto } from './dto/checkout.dto'
import type { OrderModel } from '../orders/models/order.model'
import { ProductModel } from '../products/models/product.model'
import { ProductVariantModel } from '../products/models/product-variant.model'

export interface CreatePaymentResult extends CreateOrderResult {
  prefill: {
    name: string
    email: string
    contact: string
  }
}

@Injectable()
export class CheckoutService {
  constructor(
    private readonly basketService: BasketService,
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    @InjectModel(ProductModel)
    private readonly productModel: typeof ProductModel,
    @InjectModel(ProductVariantModel)
    private readonly variantModel: typeof ProductVariantModel,
  ) {}

  /** Step 1: validate basket, compute total, create a Razorpay order. No DB order yet. */
  async createPayment(
    userId: string | null,
    sessionId: string | null,
    dto: CreateCheckoutDto,
  ): Promise<CreatePaymentResult> {
    const basket = await this.resolveBasket(userId, sessionId)
    if (!basket.items || basket.items.length === 0) {
      throw new BadRequestException('Basket is empty')
    }
    await this.validateStock(basket.items)

    const subtotal = basket.items.reduce(
      (acc: number, i: any) => acc + i.unitPrice * i.quantity,
      0,
    )
    const total = subtotal + this.getDeliveryCost(dto.deliveryMethod)

    const receipt = `rcpt_${Date.now()}`
    const order = await this.paymentsService.createOrder(total, receipt)

    const name = [dto.firstName, dto.lastName].filter(Boolean).join(' ').trim()
    return {
      ...order,
      prefill: {
        name: name || '',
        email: dto.email ?? '',
        contact: dto.phone ?? '',
      },
    }
  }

  /** Step 2: verify Razorpay signature, then create the DB order + clear basket + email. */
  async verifyAndCreateOrder(
    userId: string | null,
    sessionId: string | null,
    dto: VerifyCheckoutDto,
  ): Promise<OrderModel> {
    this.paymentsService.verifySignature(
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature,
    )

    const basket = await this.resolveBasket(userId, sessionId)
    if (!basket.items || basket.items.length === 0) {
      throw new BadRequestException('Basket is empty')
    }
    await this.validateStock(basket.items)

    const deliveryCost = this.getDeliveryCost(dto.deliveryMethod)

    const basketItems = basket.items.map((item: any) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }))

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
        country: 'IN',
      },
      dto.deliveryMethod,
      deliveryCost,
      dto.razorpayPaymentId,
    )

    await this.basketService.clearBasket(basket.id)

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

  private async resolveBasket(userId: string | null, sessionId: string | null): Promise<any> {
    if (userId) {
      return this.basketService.getOrCreateUserBasket(userId)
    }
    if (sessionId) {
      return this.basketService.getOrCreateGuestBasket(sessionId)
    }
    throw new BadRequestException('No session or user provided')
  }

  private getDeliveryCost(method: string): number {
    switch (method) {
      case 'next_day':
        return 9900 // ₹99
      case 'click_collect':
        return 0
      default:
        return 4900 // ₹49 standard
    }
  }

  /** Validates that all basket items have sufficient stock available. */
  private async validateStock(
    basketItems: Array<{ productId: string; variantId?: string | null; quantity: number }>,
  ): Promise<void> {
    const productIds = basketItems.map((i) => i.productId)
    const products = await this.productModel.findAll({
      where: { id: { [Op.in]: productIds } },
      include: [{ model: this.variantModel, as: 'variants' }],
    })
    const productMap = new Map(products.map((p) => [p.id, p]))

    for (const item of basketItems) {
      const product = productMap.get(item.productId)
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`)
      if (!product.isActive)
        throw new BadRequestException(`Product "${product.name}" is no longer available`)

      let maxStock = product.stockCount
      if (item.variantId) {
        const variant = product.variants?.find((v) => v.id === item.variantId)
        if (!variant || !variant.isActive) {
          throw new BadRequestException(
            `Selected variant for "${product.name}" is no longer available`,
          )
        }
        maxStock = Math.min(product.stockCount, variant.stockCount)
      }

      if (item.quantity > maxStock) {
        throw new BadRequestException(
          `Only ${maxStock} item(s) of "${product.name}" available. You requested ${item.quantity}.`,
        )
      }
    }
  }
}
