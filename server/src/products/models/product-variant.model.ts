import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default,
} from 'sequelize-typescript'
import { BaseModel } from '../../database/base.model'
import { ProductModel } from './product.model'

@Table({ tableName: 'product_variants', underscored: true })
export class ProductVariantModel extends BaseModel {
  @ForeignKey(() => ProductModel)
  @AllowNull(false)
  @Column({ field: 'product_id', type: DataType.UUID })
  declare productId: string

  @BelongsTo(() => ProductModel, { foreignKey: 'productId', as: 'product' })
  declare product: ProductModel

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare sku: string

  @AllowNull(false)
  @Column(DataType.STRING(200))
  declare name: string

  @AllowNull(true)
  @Column({ type: DataType.JSONB, defaultValue: {} })
  declare attributes: Record<string, string>

  @AllowNull(true)
  @Column({ field: 'price_override', type: DataType.INTEGER })
  declare priceOverride: number | null

  @Default(0)
  @AllowNull(false)
  @Column({ field: 'stock_count', type: DataType.INTEGER })
  declare stockCount: number

  @Default(true)
  @AllowNull(false)
  @Column({ field: 'is_active', type: DataType.BOOLEAN })
  declare isActive: boolean
}
