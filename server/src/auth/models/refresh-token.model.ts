import {
  Table,
  Column,
  DataType,
  AllowNull,
  Default,
  Unique,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import { BaseModel } from '../../database/base.model'
import { UserModel } from '../../users/models/user.model'

@Table({ tableName: 'refresh_tokens', underscored: true })
export class RefreshTokenModel extends BaseModel {
  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column({ field: 'user_id', type: DataType.UUID })
  declare userId: string

  @BelongsTo(() => UserModel, { foreignKey: 'userId', as: 'user' })
  declare user: UserModel

  @Unique
  @AllowNull(false)
  @Column({ field: 'token_hash', type: DataType.STRING(64) })
  declare tokenHash: string

  @AllowNull(false)
  @Column({ field: 'expires_at', type: DataType.DATE })
  declare expiresAt: Date

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  declare revoked: boolean

  @AllowNull(true)
  @Column({ field: 'replaced_by_id', type: DataType.UUID })
  declare replacedById: string | null

  @AllowNull(true)
  @Column({ field: 'user_agent', type: DataType.STRING(255) })
  declare userAgent: string | null

  @AllowNull(true)
  @Column({ field: 'ip_address', type: DataType.STRING(64) })
  declare ipAddress: string | null
}
