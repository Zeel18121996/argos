import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op, Transaction } from 'sequelize'
import { BasketModel } from './models/basket.model'
import { BasketItemModel } from './models/basket-item.model'
import { ProductModel } from '../products/models/product.model'
import { ProductImageModel } from '../products/models/product-image.model'
import { ProductVariantModel } from '../products/models/product-variant.model'

export interface BasketItemResponse {
  id: string
  productId: string
  variantId: string | null
  quantity: number
  unitPrice: number
  product: {
    id: string
    name: string
    slug: string
    sku: string
    price: number
    images: string[]
  }
}

export interface BasketResponse {
  id: string
  userId: string | null
  sessionId: string | null
  items: BasketItemResponse[]
  summary: {
    itemCount: number
    subtotal: number
    deliveryCost: number
    total: number
  }
}

@Injectable()
export class BasketService {
  constructor(
    @InjectModel(BasketModel)
    private readonly basketModel: typeof BasketModel,
    @InjectModel(BasketItemModel)
    private readonly itemModel: typeof BasketItemModel,
    @InjectModel(ProductModel)
    private readonly productModel: typeof ProductModel,
    @InjectModel(ProductVariantModel)
    private readonly variantModel: typeof ProductVariantModel,
  ) {}

  /** Get or create a guest basket keyed by sessionId. */
  async getOrCreateGuestBasket(sessionId: string): Promise<BasketModel> {
    let basket = await this.basketModel.findOne({
      where: { sessionId },
      include: [
        {
          model: BasketItemModel,
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
          ],
        },
      ],
    })
    if (!basket) {
      basket = await this.basketModel.create({ sessionId } as any)
      basket.items = []
    }
    return basket
  }

  /** Get or create an authenticated basket for a user. */
  async getOrCreateUserBasket(userId: string): Promise<BasketModel> {
    let basket = await this.basketModel.findOne({
      where: { userId },
      include: [
        {
          model: BasketItemModel,
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
          ],
        },
      ],
    })
    if (!basket) {
      basket = await this.basketModel.create({ userId } as any)
      basket.items = []
    }
    return basket
  }

  /** Add item to basket. If item exists, increment quantity. Validates stock. */
  async addItem(
    basketId: string,
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<BasketItemModel> {
    const product = await this.productModel.findByPk(productId)
    if (!product) throw new NotFoundException('Product not found')
    if (!product.isActive) throw new BadRequestException('Product is not available')

    let maxStock = product.stockCount
    if (variantId) {
      const variant = await this.variantModel.findOne({
        where: { id: variantId, productId, isActive: true },
      })
      if (!variant) throw new NotFoundException('Variant not found')
      maxStock = Math.min(product.stockCount, variant.stockCount)
    }

    const existing = await this.itemModel.findOne({
      where: { basketId, productId, variantId: variantId ?? { [Op.is]: null } },
    })

    const requestedQty = (existing?.quantity ?? 0) + quantity
    if (requestedQty > maxStock) {
      throw new BadRequestException(
        `Only ${maxStock} item(s) available. You already have ${existing?.quantity ?? 0} in your basket.`,
      )
    }

    if (existing) {
      existing.quantity += quantity
      await existing.save()
      return existing
    }

    return this.itemModel.create({
      basketId,
      productId,
      variantId: variantId ?? null,
      quantity,
      unitPrice: product.price,
    } as any)
  }

  /** Update item quantity. Validates stock. */
  async updateItem(itemId: string, quantity: number): Promise<BasketItemModel> {
    const item = await this.itemModel.findByPk(itemId)
    if (!item) throw new NotFoundException('Basket item not found')

    const product = await this.productModel.findByPk(item.productId)
    if (!product) throw new NotFoundException('Product not found')

    let maxStock = product.stockCount
    if (item.variantId) {
      const variant = await this.variantModel.findOne({
        where: { id: item.variantId, productId: item.productId, isActive: true },
      })
      if (variant) maxStock = Math.min(product.stockCount, variant.stockCount)
    }

    const newQty = Math.max(0, quantity)
    if (newQty > maxStock) {
      throw new BadRequestException(`Only ${maxStock} item(s) available. You requested ${newQty}.`)
    }

    if (newQty === 0) {
      await item.destroy()
      return item
    }

    item.quantity = newQty
    await item.save()
    return item
  }

  /** Remove item from basket. */
  async removeItem(itemId: string): Promise<void> {
    const item = await this.itemModel.findByPk(itemId)
    if (!item) throw new NotFoundException('Basket item not found')
    await item.destroy()
  }

  /** Clear all items from a basket. */
  async clearBasket(basketId: string): Promise<void> {
    await this.itemModel.destroy({ where: { basketId } })
  }

  /** Merge guest basket into user basket, then delete guest basket. */
  async mergeGuestIntoUser(guestSessionId: string, userId: string): Promise<BasketModel> {
    const guestBasket = await this.basketModel.findOne({
      where: { sessionId: guestSessionId },
      include: [{ model: BasketItemModel, as: 'items' }],
    })
    if (!guestBasket || guestBasket.items.length === 0) {
      return this.getOrCreateUserBasket(userId)
    }

    const userBasket = await this.getOrCreateUserBasket(userId)

    for (const guestItem of guestBasket.items) {
      const existing = await this.itemModel.findOne({
        where: {
          basketId: userBasket.id,
          productId: guestItem.productId,
          variantId: guestItem.variantId ?? { [Op.is]: null },
        },
      })
      if (existing) {
        existing.quantity += guestItem.quantity
        await existing.save()
      } else {
        await this.itemModel.create({
          basketId: userBasket.id,
          productId: guestItem.productId,
          variantId: guestItem.variantId,
          quantity: guestItem.quantity,
          unitPrice: guestItem.unitPrice,
        } as any)
      }
    }

    await guestBasket.destroy()
    return this.getOrCreateUserBasket(userId)
  }

  /** Build response shape from a basket model. */
  toResponse(basket: BasketModel): BasketResponse {
    const items = (basket.items || []).map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        sku: item.product.sku,
        price: item.product.price,
        images: (item.product.images || []).map((img) => img.url),
      },
    }))

    const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)
    const itemCount = items.reduce((acc, i) => acc + i.quantity, 0)

    return {
      id: basket.id,
      userId: basket.userId,
      sessionId: basket.sessionId,
      items,
      summary: {
        itemCount,
        subtotal,
        deliveryCost: 0,
        total: subtotal,
      },
    }
  }
}
