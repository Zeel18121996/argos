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

@Table({ tableName: 'product_images', underscored: true })
export class ProductImageModel extends BaseModel {
  @ForeignKey(() => ProductModel)
  @AllowNull(false)
  @Column({ field: 'product_id', type: DataType.UUID })
  declare productId: string

  @BelongsTo(() => ProductModel, { foreignKey: 'productId', as: 'product' })
  declare product: ProductModel

  @AllowNull(false)
  @Column(DataType.STRING(500))
  declare url: string

  @AllowNull(true)
  @Column({ field: 'alt_text', type: DataType.STRING(300) })
  declare altText: string | null

  @Default(0)
  @AllowNull(false)
  @Column({ field: 'sort_order', type: DataType.INTEGER })
  declare sortOrder: number

  @AllowNull(true)
  @Column({ field: 'size_label', type: DataType.STRING(20) })
  declare sizeLabel: string | null
}
