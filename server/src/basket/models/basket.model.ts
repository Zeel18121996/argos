import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
} from 'sequelize-typescript'
import { BaseModel } from '../../database/base.model'
import { UserModel } from '../../users/models/user.model'
import { BasketItemModel } from './basket-item.model'

@Table({ tableName: 'baskets', underscored: true })
export class BasketModel extends BaseModel {
  @ForeignKey(() => UserModel)
  @AllowNull(true)
  @Column({ field: 'user_id', type: DataType.UUID })
  declare userId: string | null

  @BelongsTo(() => UserModel, { foreignKey: 'userId', as: 'user' })
  declare user: UserModel | null

  @AllowNull(true)
  @Column({ field: 'session_id', type: DataType.STRING(64) })
  declare sessionId: string | null

  @HasMany(() => BasketItemModel, { foreignKey: 'basketId', as: 'items' })
  declare items: BasketItemModel[]
}
