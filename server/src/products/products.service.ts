import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op, Order, WhereOptions, literal } from 'sequelize'
import { ProductModel } from './models/product.model'
import { ProductImageModel } from './models/product-image.model'
import { ProductVariantModel } from './models/product-variant.model'
import { CategoryModel } from '../categories/models/category.model'
import { CategoriesService } from '../categories/categories.service'
import { QueryProductsDto, ProductSort } from './dto/query-products.dto'
import { AdminQueryProductsDto } from './dto/admin-query-products.dto'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { buildMeta } from '../common/dto/paginated-response.dto'

export interface ProductListItem {
  id: string
  slug: string
  sku: string
  name: string
  brand: string | null
  price: number
  compareAtPrice: number | null
  ratingAverage: number
  reviewCount: number
  stockCount: number
  inStock: boolean
  isNew: boolean
  isOnOffer: boolean
  isClearance: boolean
  isActive: boolean
  categoryId: string
  categorySlug: string
  categoryName: string
  images: string[]
}

export interface ProductDetail extends ProductListItem {
  description: string | null
  features: string[]
  specifications: Array<{ name: string; value: string }>
  deliveryOptions: Array<{ type: string; label: string; price: number; availableFrom?: string }>
  reserveAvailable: boolean
  variants: Array<{
    id: string
    sku: string
    name: string
    attributes: Record<string, string>
    priceOverride: number | null
    stockCount: number
    isActive: boolean
  }>
  imagesFull: Array<{
    id: string
    url: string
    altText: string | null
    sortOrder: number
    sizeLabel: string | null
  }>
}

function toListItem(product: ProductModel): ProductListItem {
  const category = product.category as CategoryModel | undefined
  const images = (product.images || []).map((img) => img.url)
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    ratingAverage: Number(product.ratingAverage),
    reviewCount: product.reviewCount,
    stockCount: product.stockCount,
    inStock: product.stockCount > 0,
    isNew: product.isNew,
    isOnOffer: product.isOnOffer,
    isClearance: product.isClearance,
    isActive: product.isActive,
    categoryId: product.categoryId,
    categorySlug: category?.slug ?? '',
    categoryName: category?.name ?? '',
    images: images.length ? images : [],
  }
}

function toDetail(product: ProductModel): ProductDetail {
  const base = toListItem(product)
  return {
    ...base,
    description: product.description,
    features: product.features ?? [],
    specifications: product.specifications ?? [],
    deliveryOptions: (product.deliveryOptions ?? []) as ProductDetail['deliveryOptions'],
    reserveAvailable: product.reserveAvailable,
    variants: (product.variants || []).map((v) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      attributes: v.attributes ?? {},
      priceOverride: v.priceOverride,
      stockCount: v.stockCount,
      isActive: v.isActive,
    })),
    imagesFull: (product.images || []).map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      sortOrder: img.sortOrder,
      sizeLabel: img.sizeLabel,
    })),
  }
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(ProductModel)
    private readonly productModel: typeof ProductModel,
    @InjectModel(ProductImageModel)
    private readonly imageModel: typeof ProductImageModel,
    @InjectModel(ProductVariantModel)
    private readonly variantModel: typeof ProductVariantModel,
    private readonly categoriesService: CategoriesService,
  ) {}

  /** Public product list with filters, sort, pagination. */
  async findAllPublic(query: QueryProductsDto) {
    const { page = 1, limit = 24 } = query

    let categoryId = query.categoryId
    if (!categoryId && query.categorySlug) {
      const cat = await this.categoriesService.findBySlug(query.categorySlug).catch(() => null)
      if (cat) categoryId = cat.id
    }

    // Expand parent categories to include all descendants so /browse/<parent>
    // surfaces products seeded against leaf subcategories.
    let categoryIds: string[] | undefined
    if (categoryId) {
      categoryIds = await this.categoriesService.findDescendantIds(categoryId)
    }

    const whereClause = this.buildPublicWhere({ ...query, categoryId }, categoryIds)
    // Popular sort: restrict to products that have been ordered at least once.
    // Ordering by total quantity sold is handled in buildOrder.
    if (query.sortBy === ProductSort.popular) {
      ;(whereClause as any)[Op.and] = [
        ...(((whereClause as any)[Op.and] as unknown[]) ?? []),
        literal('EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = "ProductModel"."id")'),
      ]
    }

    const { rows, count } = await this.productModel.findAndCountAll({
      where: whereClause,
      include: [
        { model: CategoryModel, as: 'category', attributes: ['id', 'slug', 'name'] },
        { model: ProductImageModel, as: 'images', separate: true, order: [['sort_order', 'ASC']] },
      ],
      order: this.buildOrder(query.sortBy),
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    })

    return {
      items: rows.map(toListItem),
      meta: buildMeta(page, limit, count),
    }
  }

  /** Public product detail by slug. */
  async findOnePublic(slug: string): Promise<ProductDetail> {
    const product = await this.productModel.findOne({
      where: { slug, isActive: true },
      include: [
        { model: CategoryModel, as: 'category', attributes: ['id', 'slug', 'name'] },
        { model: ProductImageModel, as: 'images', separate: true, order: [['sort_order', 'ASC']] },
        {
          model: ProductVariantModel,
          as: 'variants',
          separate: true,
          order: [['created_at', 'ASC']],
        },
      ],
    })
    if (!product) throw new NotFoundException(`Product "${slug}" not found`)
    return toDetail(product)
  }

  /** Admin product list (includes inactive). */
  async findAllAdmin(query: AdminQueryProductsDto) {
    const { page = 1, limit = 30 } = query
    const { rows, count } = await this.productModel.findAndCountAll({
      where: this.buildAdminWhere(query),
      include: [
        { model: CategoryModel, as: 'category', attributes: ['id', 'slug', 'name'] },
        { model: ProductImageModel, as: 'images', separate: true, order: [['sort_order', 'ASC']] },
      ],
      order: this.buildOrder(query.sortBy as ProductSort),
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    })

    return {
      items: rows.map(toListItem),
      meta: buildMeta(page, limit, count),
    }
  }

  /** Admin: get single product (any status). */
  async findOneAdmin(id: string): Promise<ProductDetail> {
    const product = await this.productModel.findByPk(id, {
      include: [
        { model: CategoryModel, as: 'category', attributes: ['id', 'slug', 'name'] },
        { model: ProductImageModel, as: 'images', separate: true, order: [['sort_order', 'ASC']] },
        {
          model: ProductVariantModel,
          as: 'variants',
          separate: true,
          order: [['created_at', 'ASC']],
        },
      ],
    })
    if (!product) throw new NotFoundException(`Product ${id} not found`)
    return toDetail(product)
  }

  /** Admin: create product. */
  async create(dto: CreateProductDto): Promise<ProductDetail> {
    const product = await this.productModel.create({
      ...dto,
      categoryId: dto.categoryId,
    } as any)
    return this.findOneAdmin(product.id)
  }

  /** Admin: update product. */
  async update(id: string, dto: UpdateProductDto): Promise<ProductDetail> {
    const product = await this.productModel.findByPk(id)
    if (!product) throw new NotFoundException(`Product ${id} not found`)

    if (dto.categoryId !== undefined) product.categoryId = dto.categoryId
    if (dto.name !== undefined) product.name = dto.name
    if (dto.slug !== undefined) product.slug = dto.slug
    if (dto.sku !== undefined) product.sku = dto.sku
    if (dto.brand !== undefined) product.brand = dto.brand ?? null
    if (dto.description !== undefined) product.description = dto.description ?? null
    if (dto.price !== undefined) product.price = dto.price
    if (dto.compareAtPrice !== undefined) product.compareAtPrice = dto.compareAtPrice ?? null
    if (dto.stockCount !== undefined) product.stockCount = dto.stockCount
    if (dto.features !== undefined) product.features = dto.features ?? []
    if (dto.specifications !== undefined) product.specifications = dto.specifications ?? []
    if (dto.deliveryOptions !== undefined)
      product.deliveryOptions = (dto.deliveryOptions ?? []) as any
    if (dto.isActive !== undefined) product.isActive = dto.isActive
    if (dto.isFeatured !== undefined) product.isFeatured = dto.isFeatured
    if (dto.isOnOffer !== undefined) product.isOnOffer = dto.isOnOffer
    if (dto.isNew !== undefined) product.isNew = dto.isNew
    if (dto.isClearance !== undefined) product.isClearance = dto.isClearance
    if (dto.reserveAvailable !== undefined) product.reserveAvailable = dto.reserveAvailable

    await product.save()
    return this.findOneAdmin(product.id)
  }

  /** Admin: soft-delete (deactivate) product. */
  async deactivate(id: string): Promise<void> {
    const product = await this.productModel.findByPk(id)
    if (!product) throw new NotFoundException(`Product ${id} not found`)
    product.isActive = false
    await product.save()
  }

  /** Admin: hard delete product. */
  async remove(id: string): Promise<void> {
    const product = await this.productModel.findByPk(id)
    if (!product) throw new NotFoundException(`Product ${id} not found`)
    await product.destroy()
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private buildPublicWhere(query: QueryProductsDto, categoryIds?: string[]): WhereOptions {
    const where: any = { isActive: true }

    if (categoryIds && categoryIds.length > 1) {
      where.categoryId = { [Op.in]: categoryIds }
    } else if (query.categoryId) {
      where.categoryId = query.categoryId
    }
    if (query.slugs?.length) where.slug = { [Op.in]: query.slugs }
    else if (query.slug) where.slug = query.slug
    if (query.brands?.length) where.brand = { [Op.in]: query.brands }
    if (query.minPrice !== undefined) {
      where.price = { ...(where.price || {}), [Op.gte]: query.minPrice }
    }
    if (query.maxPrice !== undefined) {
      where.price = { ...(where.price || {}), [Op.lte]: query.maxPrice }
    }
    if (query.inStock) where.stockCount = { [Op.gt]: 0 }
    if (query.onOffer) where.isOnOffer = true
    if (query.isNew) where.isNew = true
    if (query.isFeatured) where.isFeatured = true
    if (query.isClearance) where.isClearance = true
    if (query.q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${query.q}%` } },
        { brand: { [Op.iLike]: `%${query.q}%` } },
        { description: { [Op.iLike]: `%${query.q}%` } },
      ]
    }
    return where
  }

  private buildAdminWhere(query: AdminQueryProductsDto): WhereOptions {
    const where: any = {}

    if (query.categoryId) where.categoryId = query.categoryId
    if (query.brand) where.brand = { [Op.iLike]: `%${query.brand}%` }
    if (query.isActive !== undefined) where.isActive = query.isActive
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured
    if (query.isOnOffer !== undefined) where.isOnOffer = query.isOnOffer
    if (query.q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${query.q}%` } },
        { brand: { [Op.iLike]: `%${query.q}%` } },
        { sku: { [Op.iLike]: `%${query.q}%` } },
        { slug: { [Op.iLike]: `%${query.q}%` } },
      ]
    }
    return where
  }

  private buildOrder(sortBy?: ProductSort): Order {
    if (sortBy === 'price-asc') return [['price', 'ASC']]
    if (sortBy === 'price-desc') return [['price', 'DESC']]
    if (sortBy === 'rating') return [['rating_average', 'DESC']]
    if (sortBy === 'newest') return [['created_at', 'DESC']]
    if (sortBy === 'popular') {
      return [
        [
          literal(
            '(SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.product_id = "ProductModel"."id")',
          ),
          'DESC',
        ],
      ]
    }
    // relevance / default
    return [['created_at', 'DESC']]
  }
}
