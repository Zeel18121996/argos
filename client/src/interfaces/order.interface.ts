import type { CartItem } from './cart.interface'
import type { Address } from './user.interface'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  items: CartItem[]
  deliveryAddress: Address
  subtotal: number
  deliveryCost: number
  total: number
  createdAt: string
  estimatedDelivery?: string
  trackingNumber?: string
}

export interface CheckoutPayload {
  deliveryAddressId?: string
  newAddress?: Omit<Address, 'id' | 'isDefault'>
  deliveryType: 'home' | 'store'
  storeId?: string
  paymentMethod: 'card'
  cardLast4?: string
  voucherCode?: string
}
