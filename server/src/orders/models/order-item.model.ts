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
import { OrderModel } from './order.model'
import { ProductModel } from '../../products/models/product.model'
import { ProductVariantModel } from '../../products/models/product-variant.model'

@Table({ tableName: 'order_items', underscored: true })
export class OrderItemModel extends BaseModel {
  @ForeignKey(() => OrderModel)
  @AllowNull(false)
  @Column({ field: 'order_id', type: DataType.UUID })
  declare orderId: string

  @BelongsTo(() => OrderModel, { foreignKey: 'orderId', as: 'order' })
  declare order: OrderModel

  @ForeignKey(() => ProductModel)
  @AllowNull(false)
  @Column({ field: 'product_id', type: DataType.UUID })
  declare productId: string

  @BelongsTo(() => ProductModel, { foreignKey: 'productId', as: 'product' })
  declare product: ProductModel

  @ForeignKey(() => ProductVariantModel)
  @AllowNull(true)
  @Column({ field: 'variant_id', type: DataType.UUID })
  declare variantId: string | null

  @BelongsTo(() => ProductVariantModel, { foreignKey: 'variantId', as: 'variant' })
  declare variant: ProductVariantModel | null

  @AllowNull(false)
  @Column({ field: 'product_name', type: DataType.STRING(300) })
  declare productName: string

  @AllowNull(true)
  @Column({ field: 'variant_name', type: DataType.STRING(100) })
  declare variantName: string | null

  @Default(1)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare quantity: number

  @Default(0)
  @AllowNull(false)
  @Column({ field: 'unit_price', type: DataType.INTEGER })
  declare unitPrice: number

  @Default(0)
  @AllowNull(false)
  @Column({ field: 'total_price', type: DataType.INTEGER })
  declare totalPrice: number
}
