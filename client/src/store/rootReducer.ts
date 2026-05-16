import { combineReducers } from '@reduxjs/toolkit'
import cartReducer from './slices/cartSlice'
import authReducer from './slices/authSlice'
import wishlistReducer from './slices/wishlistSlice'
import uiReducer from './slices/uiSlice'

const rootReducer = combineReducers({
  cart: cartReducer,
  auth: authReducer,
  wishlist: wishlistReducer,
  ui: uiReducer,
})

export default rootReducer
