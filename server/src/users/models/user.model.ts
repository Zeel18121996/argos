import { Table, Column, DataType, AllowNull, Default, Unique, HasMany } from 'sequelize-typescript'
import { BaseModel } from '../../database/base.model'
import { AddressModel } from './address.model'

export type UserRole = 'customer' | 'staff' | 'admin'

@Table({ tableName: 'users', underscored: true })
export class UserModel extends BaseModel {
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(320))
  declare email: string

  @AllowNull(false)
  @Column({ field: 'password_hash', type: DataType.STRING })
  declare passwordHash: string

  @AllowNull(false)
  @Column({ field: 'first_name', type: DataType.STRING(80) })
  declare firstName: string

  @AllowNull(false)
  @Column({ field: 'last_name', type: DataType.STRING(80) })
  declare lastName: string

  @AllowNull(true)
  @Column(DataType.STRING(40))
  declare phone: string | null

  @Default('customer')
  @AllowNull(false)
  @Column(DataType.STRING(20))
  declare role: UserRole

  @Default(true)
  @AllowNull(false)
  @Column({ field: 'is_active', type: DataType.BOOLEAN })
  declare isActive: boolean

  @Default(false)
  @AllowNull(false)
  @Column({ field: 'email_verified', type: DataType.BOOLEAN })
  declare emailVerified: boolean

  @Default(false)
  @AllowNull(false)
  @Column({ field: 'marketing_opt_in', type: DataType.BOOLEAN })
  declare marketingOptIn: boolean

  @AllowNull(true)
  @Column({ field: 'password_reset_token', type: DataType.STRING })
  declare passwordResetToken: string | null

  @AllowNull(true)
  @Column({ field: 'password_reset_expires', type: DataType.DATE })
  declare passwordResetExpires: Date | null

  @AllowNull(true)
  @Column({ field: 'last_login_at', type: DataType.DATE })
  declare lastLoginAt: Date | null

  @HasMany(() => AddressModel, { foreignKey: 'userId', as: 'addresses' })
  declare addresses: AddressModel[]

  // ── Serialisation helpers ──────────────────────────────────────────────────
  toPublicJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      role: this.role,
      emailVerified: this.emailVerified,
      marketingOptIn: this.marketingOptIn,
      createdAt: this.createdAt,
    }
  }
}
