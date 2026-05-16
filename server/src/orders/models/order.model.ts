import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
  Default,
} from 'sequelize-typescript'
import { BaseModel } from '../../database/base.model'
import { UserModel } from '../../users/models/user.model'
import { OrderItemModel } from './order-item.model'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

@Table({ tableName: 'orders', underscored: true })
export class OrderModel extends BaseModel {
  @AllowNull(false)
  @Column({ field: 'order_number', type: DataType.STRING(40) })
  declare orderNumber: string

  @ForeignKey(() => UserModel)
  @AllowNull(true)
  @Column({ field: 'user_id', type: DataType.UUID })
  declare userId: string | null

  @BelongsTo(() => UserModel, { foreignKey: 'userId', as: 'user' })
  declare user: UserModel | null

  @AllowNull(true)
  @Column({ field: 'guest_email', type: DataType.STRING(320) })
  declare guestEmail: string | null

  @Default('pending')
  @AllowNull(false)
  @Column({ type: DataType.STRING(20) })
  declare status: OrderStatus

  @Default(0)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare subtotal: number

  @Default(0)
  @AllowNull(false)
  @Column({ field: 'delivery_cost', type: DataType.INTEGER })
  declare deliveryCost: number

  @Default(0)
  @AllowNull(false)
  @Column({ field: 'discount_amount', type: DataType.INTEGER })
  declare discountAmount: number

  @Default(0)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare total: number

  @AllowNull(true)
  @Column({ field: 'payment_intent_id', type: DataType.STRING(100) })
  declare paymentIntentId: string | null

  @Default('pending')
  @AllowNull(false)
  @Column({ field: 'payment_status', type: DataType.STRING(20) })
  declare paymentStatus: PaymentStatus

  @AllowNull(true)
  @Column({ field: 'delivery_method', type: DataType.STRING(20) })
  declare deliveryMethod: string | null

  @AllowNull(true)
  @Column({ field: 'delivery_address', type: DataType.JSONB })
  declare deliveryAddress: Record<string, unknown> | null

  @AllowNull(true)
  @Column({ field: 'tracking_number', type: DataType.STRING(100) })
  declare trackingNumber: string | null

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare notes: string | null

  @HasMany(() => OrderItemModel, { foreignKey: 'orderId', as: 'items' })
  declare items: OrderItemModel[]
}
