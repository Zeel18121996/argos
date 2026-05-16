import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
  Default,
  Unique,
} from 'sequelize-typescript'
import { BaseModel } from '../../database/base.model'
import { CategoryModel } from '../../categories/models/category.model'
import { ProductImageModel } from './product-image.model'
import { ProductVariantModel } from './product-variant.model'

export interface DeliveryOption {
  type: 'standard' | 'express' | 'next-day' | 'fast-track'
  label: string
  price: number
  availableFrom?: string
}

export interface ProductSpec {
  name: string
  value: string
}

@Table({ tableName: 'products', underscored: true })
export class ProductModel extends BaseModel {
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(220))
  declare slug: string

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare sku: string

  @AllowNull(false)
  @Column(DataType.STRING(300))
  declare name: string

  @AllowNull(true)
  @Column(DataType.STRING(100))
  declare brand: string | null

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description: string | null

  @ForeignKey(() => CategoryModel)
  @AllowNull(false)
  @Column({ field: 'category_id', type: DataType.UUID })
  declare categoryId: string

  @BelongsTo(() => CategoryModel, { foreignKey: 'categoryId', as: 'category' })
  declare category: CategoryModel

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare price: number

  @AllowNull(true)
  @Column({ field: 'compare_at_price', type: DataType.INTEGER })
  declare compareAtPrice: number | null

  @Default(0)
  @AllowNull(false)
  @Column({ field: 'stock_count', type: DataType.INTEGER })
  declare stockCount: number

  @Default(0)
  @AllowNull(false)
  @Column({ field: 'rating_average', type: DataType.DECIMAL(2, 1) })
  declare ratingAverage: number

  @Default(0)
  @AllowNull(false)
  @Column({ field: 'review_count', type: DataType.INTEGER })
  declare reviewCount: number

  @AllowNull(true)
  @Column({ type: DataType.JSONB, defaultValue: [] })
  declare features: string[]

  @AllowNull(true)
  @Column({ type: DataType.JSONB, defaultValue: [] })
  declare specifications: ProductSpec[]

  @AllowNull(true)
  @Column({ field: 'delivery_options', type: DataType.JSONB, defaultValue: [] })
  declare deliveryOptions: DeliveryOption[]

  @Default(true)
  @AllowNull(false)
  @Column({ field: 'is_active', type: DataType.BOOLEAN })
  declare isActive: boolean

  @Default(false)
  @AllowNull(false)
  @Column({ field: 'is_featured', type: DataType.BOOLEAN })
  declare isFeatured: boolean

  @Default(false)
  @AllowNull(false)
  @Column({ field: 'is_on_offer', type: DataType.BOOLEAN })
  declare isOnOffer: boolean

  @Default(false)
  @AllowNull(false)
  @Column({ field: 'is_new', type: DataType.BOOLEAN })
  declare isNew: boolean

  @Default(false)
  @AllowNull(false)
  @Column({ field: 'is_clearance', type: DataType.BOOLEAN })
  declare isClearance: boolean

  @Default(false)
  @AllowNull(false)
  @Column({ field: 'reserve_available', type: DataType.BOOLEAN })
  declare reserveAvailable: boolean

  @HasMany(() => ProductImageModel, { foreignKey: 'productId', as: 'images' })
  declare images: ProductImageModel[]

  @HasMany(() => ProductVariantModel, { foreignKey: 'productId', as: 'variants' })
  declare variants: ProductVariantModel[]
}
