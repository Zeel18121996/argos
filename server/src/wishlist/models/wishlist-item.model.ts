import { Table, Column, DataType, ForeignKey, BelongsTo, AllowNull } from 'sequelize-typescript'
import { BaseModel } from '../../database/base.model'
import { UserModel } from '../../users/models/user.model'
import { ProductModel } from '../../products/models/product.model'

@Table({ tableName: 'wishlist_items', underscored: true })
export class WishlistItemModel extends BaseModel {
  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column({ field: 'user_id', type: DataType.UUID })
  declare userId: string

  @BelongsTo(() => UserModel, { foreignKey: 'userId', as: 'user' })
  declare user: UserModel

  @ForeignKey(() => ProductModel)
  @AllowNull(false)
  @Column({ field: 'product_id', type: DataType.UUID })
  declare productId: string

  @BelongsTo(() => ProductModel, { foreignKey: 'productId', as: 'product' })
  declare product: ProductModel
}
