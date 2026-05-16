import {
  Table,
  Column,
  DataType,
  AllowNull,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import { BaseModel } from '../../database/base.model'
import { UserModel } from './user.model'

@Table({ tableName: 'addresses', underscored: true })
export class AddressModel extends BaseModel {
  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column({ field: 'user_id', type: DataType.UUID })
  declare userId: string

  @BelongsTo(() => UserModel, { foreignKey: 'userId', as: 'user' })
  declare user: UserModel

  @Default(false)
  @AllowNull(false)
  @Column({ field: 'is_default', type: DataType.BOOLEAN })
  declare isDefault: boolean

  @AllowNull(false)
  @Column({ field: 'first_name', type: DataType.STRING(80) })
  declare firstName: string

  @AllowNull(false)
  @Column({ field: 'last_name', type: DataType.STRING(80) })
  declare lastName: string

  @AllowNull(false)
  @Column(DataType.STRING(200))
  declare line1: string

  @AllowNull(true)
  @Column(DataType.STRING(200))
  declare line2: string | null

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare city: string

  @AllowNull(false)
  @Column(DataType.STRING(20))
  declare postcode: string

  @Default('GB')
  @AllowNull(false)
  @Column(DataType.STRING(2))
  declare country: string

  @AllowNull(true)
  @Column(DataType.STRING(40))
  declare phone: string | null
}
