import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { WishlistItemModel } from './models/wishlist-item.model'
import { ProductModel } from '../products/models/product.model'
import { ProductImageModel } from '../products/models/product-image.model'

export interface WishlistResponse {
  id: string
  productId: string
  product: {
    id: string
    name: string
    slug: string
    sku: string
    price: number
    images: string[]
    inStock: boolean
  }
}

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(WishlistItemModel)
    private readonly wishlistModel: typeof WishlistItemModel,
  ) {}

  async getWishlist(userId: string): Promise<WishlistItemModel[]> {
    return this.wishlistModel.findAll({
      where: { userId },
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
      order: [['created_at', 'DESC']],
    })
  }

  async addItem(userId: string, productId: string): Promise<WishlistItemModel> {
    const [item, created] = await this.wishlistModel.findOrCreate({
      where: { userId, productId },
      defaults: { userId, productId } as any,
    })
    return item
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    await this.wishlistModel.destroy({ where: { userId, productId } })
  }

  toResponse(items: WishlistItemModel[]): WishlistResponse[] {
    return items.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        sku: item.product.sku,
        price: item.product.price,
        images: (item.product.images || []).map((img) => img.url),
        inStock: item.product.stockCount > 0,
      },
    }))
  }
}
