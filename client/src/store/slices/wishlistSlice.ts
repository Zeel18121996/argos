import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Product } from '@/interfaces/product.interface'
import { storage } from '@/utils/storage'

interface WishlistState {
  items: Product[]
}

const WISHLIST_KEY = 'argos_wishlist'

const initialState: WishlistState = {
  items: storage.get<Product[]>(WISHLIST_KEY) ?? [],
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist(state, action: PayloadAction<Product>) {
      const idx = state.items.findIndex((p) => p.id === action.payload.id)
      if (idx >= 0) {
        state.items.splice(idx, 1)
      } else {
        state.items.push(action.payload)
      }
      storage.set(WISHLIST_KEY, state.items)
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter((p) => p.id !== action.payload)
      storage.set(WISHLIST_KEY, state.items)
    },
  },
})

export const { toggleWishlist, removeFromWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
