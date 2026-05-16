import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CartItem } from '@/interfaces/cart.interface'
import type { Product } from '@/interfaces/product.interface'
import { storage } from '@/utils/storage'

interface CartState {
  items: CartItem[]
  voucherCode: string | null
  voucherDiscount: number
}

const CART_KEY = 'argos_cart'

const initialState: CartState = {
  items: storage.get<CartItem[]>(CART_KEY) ?? [],
  voucherCode: null,
  voucherDiscount: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const existing = state.items.find((i) => i.product.id === action.payload.id)
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({ product: action.payload, quantity: 1 })
      }
      storage.set(CART_KEY, state.items)
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.product.id !== action.payload)
      storage.set(CART_KEY, state.items)
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find((i) => i.product.id === action.payload.productId)
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity)
      }
      storage.set(CART_KEY, state.items)
    },
    saveForLater(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.product.id === action.payload)
      if (item) item.savedForLater = true
      storage.set(CART_KEY, state.items)
    },
    moveToCart(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.product.id === action.payload)
      if (item) item.savedForLater = false
      storage.set(CART_KEY, state.items)
    },
    applyVoucher(state, action: PayloadAction<{ code: string; discount: number }>) {
      state.voucherCode = action.payload.code
      state.voucherDiscount = action.payload.discount
    },
    removeVoucher(state) {
      state.voucherCode = null
      state.voucherDiscount = 0
    },
    clearCart(state) {
      state.items = []
      state.voucherCode = null
      state.voucherDiscount = 0
      storage.remove(CART_KEY)
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  saveForLater,
  moveToCart,
  applyVoucher,
  removeVoucher,
  clearCart,
} = cartSlice.actions

export default cartSlice.reducer
