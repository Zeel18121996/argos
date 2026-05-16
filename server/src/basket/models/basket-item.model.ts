import { Table, Column, DataType, ForeignKey, BelongsTo, AllowNull } from 'sequelize-typescript'
import { BaseModel } from '../../database/base.model'
import { BasketModel } from './basket.model'
import { ProductModel } from '../../products/models/product.model'
import { ProductVariantModel } from '../../products/models/product-variant.model'

@Table({ tableName: 'basket_items', underscored: true })
export class BasketItemModel extends BaseModel {
  @ForeignKey(() => BasketModel)
  @AllowNull(false)
  @Column({ field: 'basket_id', type: DataType.UUID })
  declare basketId: string

  @BelongsTo(() => BasketModel, { foreignKey: 'basketId', as: 'basket' })
  declare basket: BasketModel

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
  @Column(DataType.INTEGER)
  declare quantity: number

  @AllowNull(false)
  @Column({ field: 'unit_price', type: DataType.INTEGER })
  declare unitPrice: number
}
