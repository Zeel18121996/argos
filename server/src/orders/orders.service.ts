import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { OrderModel, OrderStatus } from './models/order.model'
import { OrderItemModel } from './models/order-item.model'
import { ProductModel } from '../products/models/product.model'
import { ProductImageModel } from '../products/models/product-image.model'
import { ProductVariantModel } from '../products/models/product-variant.model'
import { buildMeta } from '../common/dto/paginated-response.dto'
import type { QueryOrderDto, AdminQueryOrderDto, UpdateOrderStatusDto } from './dto/order.dto'
import { Sequelize } from 'sequelize-typescript'

export interface OrderItemResponse {
  id: string
  productId: string
  variantId: string | null
  productName: string
  variantName: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  product: {
    id: string
    name: string
    slug: string
    sku: string
    price: number
    images: string[]
  } | null
}

export interface OrderSummary {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  itemCount: number
  createdAt: Date
}

export interface OrderDetail extends OrderSummary {
  subtotal: number
  deliveryCost: number
  discountAmount: number
  paymentStatus: string
  deliveryMethod: string | null
  deliveryAddress: Record<string, unknown> | null
  trackingNumber: string | null
  items: OrderItemResponse[]
  guestEmail: string | null
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(OrderModel) private readonly orderModel: typeof OrderModel,
    @InjectModel(OrderItemModel) private readonly itemModel: typeof OrderItemModel,
    @InjectModel(ProductModel) private readonly productModel: typeof ProductModel,
    @InjectModel(ProductVariantModel) private readonly variantModel: typeof ProductVariantModel,
  ) {}

  async findUserOrders(userId: string, query: QueryOrderDto) {
    const { page = 1, limit = 30 } = query
    const { count, rows } = await this.orderModel.findAndCountAll({
      where: { userId },
      include: [{ model: OrderItemModel, as: 'items' }],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    })
    return {
      data: rows.map((r) => this.toSummary(r)),
      meta: buildMeta(page, limit, count as number),
    }
  }

  async findOne(orderId: string, userId?: string): Promise<OrderDetail> {
    const order = await this.orderModel.findByPk(orderId, {
      include: [
        {
          model: OrderItemModel,
          as: 'items',
          include: [
            {
              model: ProductModel,
              as: 'product',
              include: [
                {
                  model: ProductImageModel,
                  as: 'images',
                  separate: true,
                  order: [['sort_order', 'ASC']],
                },
              ],
            },
            {
              model: ProductVariantModel,
              as: 'variant',
            },
          ],
        },
      ],
    })
    if (!order) throw new NotFoundException('Order not found')
    if (userId && order.userId !== userId) throw new ForbiddenException()
    return this.toDetail(order)
  }

  async createFromBasket(
    userId: string | null,
    guestEmail: string | null,
    basketItems: Array<{
      productId: string
      variantId?: string | null
      quantity: number
      unitPrice: number
    }>,
    deliveryAddress: Record<string, unknown>,
    deliveryMethod: string,
    deliveryCost: number,
    paymentIntentId: string,
  ): Promise<OrderModel> {
    const orderNumber = `ORD-${Date.now()}`
    const subtotal = basketItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)
    const total = subtotal + deliveryCost

    const order = await this.orderModel.create({
      orderNumber,
      userId,
      guestEmail,
      status: 'confirmed',
      subtotal,
      deliveryCost,
      discountAmount: 0,
      total,
      paymentIntentId,
      paymentStatus: 'paid',
      deliveryMethod,
      deliveryAddress,
    } as any)

    const products = await this.productModel.findAll({
      where: { id: { [Op.in]: basketItems.map((i) => i.productId) } },
      include: [{ model: ProductVariantModel, as: 'variants' }],
    })
    const productMap = new Map(products.map((p) => [p.id, p]))

    const itemsData = basketItems.map((item) => {
      const product = productMap.get(item.productId)
      const variant = product?.variants?.find((v) => v.id === item.variantId)
      return {
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId ?? null,
        productName: product?.name ?? 'Unknown product',
        variantName: variant?.name ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
      }
    })

    await this.itemModel.bulkCreate(itemsData as any)

    // Decrement stock for all items
    await this.decrementStock(basketItems)

    return order
  }

  async cancel(orderId: string, userId?: string): Promise<OrderModel> {
    const order = await this.orderModel.findByPk(orderId)
    if (!order) throw new NotFoundException('Order not found')
    if (userId && order.userId !== userId) throw new ForbiddenException()
    if (!VALID_TRANSITIONS[order.status].includes('cancelled'))
      throw new ForbiddenException('Order cannot be cancelled at this stage')
    order.status = 'cancelled'
    await order.save()

    // Restore stock for cancelled order
    await this.restoreStock(orderId)

    return order
  }

  async track(orderNumber: string, postcode: string) {
    const order = await this.orderModel.findOne({
      where: { orderNumber },
    })
    if (!order) throw new NotFoundException('Order not found')
    const addr = (order.deliveryAddress ?? {}) as Record<string, string>
    if (
      addr.postcode?.toUpperCase().replace(/\s/g, '') !== postcode.toUpperCase().replace(/\s/g, '')
    )
      throw new NotFoundException('Order not found')
    return { status: order.status, trackingNumber: order.trackingNumber }
  }

  /** Admin: list all orders */
  async findAll(query: AdminQueryOrderDto) {
    const { page = 1, limit = 30, status, q, from, to } = query
    const where: Record<string, unknown> = {}
    if (status) where['status'] = status
    if (from || to) {
      where['created_at'] = {}
      if (from) (where['created_at'] as any)[Op.gte] = new Date(from)
      if (to) (where['created_at'] as any)[Op.lte] = new Date(to)
    }
    if (q) {
      where[Op.or as any] = [{ orderNumber: { [Op.iLike]: `%${q}%` } }]
    }
    const { count, rows } = await this.orderModel.findAndCountAll({
      where,
      include: [{ model: OrderItemModel, as: 'items' }],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    })
    return {
      data: rows.map((r) => this.toSummary(r)),
      meta: buildMeta(page, limit, count as number),
    }
  }

  /** Admin: update status */
  async updateStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<OrderModel> {
    const order = await this.orderModel.findByPk(orderId)
    if (!order) throw new NotFoundException('Order not found')
    const next = dto.next as OrderStatus
    if (!VALID_TRANSITIONS[order.status].includes(next))
      throw new ForbiddenException(`Cannot transition from ${order.status} to ${next}`)

    const previousStatus = order.status
    order.status = next
    if (dto.trackingNumber) order.trackingNumber = dto.trackingNumber
    if (dto.note) order.notes = order.notes ? `${order.notes}\n${dto.note}` : dto.note
    await order.save()

    // Restore stock if moving to cancelled
    if (next === 'cancelled' && previousStatus !== 'cancelled') {
      await this.restoreStock(orderId)
    }

    return order
  }

  /** Decrement stock for all items in an order */
  private async decrementStock(
    items: Array<{ productId: string; variantId?: string | null; quantity: number }>,
  ): Promise<void> {
    for (const item of items) {
      await this.productModel.update(
        { stockCount: Sequelize.literal(`stock_count - ${item.quantity}`) },
        { where: { id: item.productId } },
      )
      if (item.variantId) {
        await this.variantModel.update(
          { stockCount: Sequelize.literal(`stock_count - ${item.quantity}`) },
          { where: { id: item.variantId } },
        )
      }
    }
  }

  /** Restore stock for all items in a cancelled order */
  private async restoreStock(orderId: string): Promise<void> {
    const items = await this.itemModel.findAll({ where: { orderId } })
    for (const item of items) {
      await this.productModel.update(
        { stockCount: Sequelize.literal(`stock_count + ${item.quantity}`) },
        { where: { id: item.productId } },
      )
      if (item.variantId) {
        await this.variantModel.update(
          { stockCount: Sequelize.literal(`stock_count + ${item.quantity}`) },
          { where: { id: item.variantId } },
        )
      }
    }
  }

  private toSummary(order: OrderModel): OrderSummary {
    const itemCount = (order.items ?? []).reduce((sum, it) => sum + (it.quantity ?? 0), 0)
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      itemCount,
      createdAt: order.createdAt,
    }
  }

  private toDetail(order: OrderModel): OrderDetail {
    const items = (order.items || []).map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            sku: item.product.sku,
            price: item.product.price,
            images: (item.product.images || []).map((img) => img.url),
          }
        : null,
    }))
    return {
      ...this.toSummary(order),
      subtotal: order.subtotal,
      deliveryCost: order.deliveryCost,
      discountAmount: order.discountAmount,
      paymentStatus: order.paymentStatus,
      deliveryMethod: order.deliveryMethod,
      deliveryAddress: order.deliveryAddress,
      trackingNumber: order.trackingNumber,
      items,
      guestEmail: order.guestEmail,
    }
  }
}
