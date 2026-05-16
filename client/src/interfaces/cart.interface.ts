import type { Product } from './product.interface'

export interface CartItem {
  product: Product
  quantity: number
  savedForLater?: boolean
}

export interface Cart {
  items: CartItem[]
  voucherCode?: string
  voucherDiscount?: number
}

export interface CartSummary {
  subtotal: number
  deliveryCost: number
  voucherDiscount: number
  total: number
  itemCount: number
}
