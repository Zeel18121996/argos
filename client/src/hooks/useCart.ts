import { useAppSelector, useAppDispatch } from './useRedux'
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  saveForLater,
  moveToCart,
  clearCart,
} from '@/store/slices/cartSlice'
import { showToast } from '@/store/slices/uiSlice'
import type { Product } from '@/interfaces/product.interface'
import type { CartSummary } from '@/interfaces/cart.interface'

export const useCart = () => {
  const dispatch = useAppDispatch()
  const { items, voucherCode, voucherDiscount } = useAppSelector((s) => s.cart)

  const activeItems = items.filter((i) => !i.savedForLater)
  const savedItems = items.filter((i) => i.savedForLater)

  const summary: CartSummary = {
    itemCount: activeItems.reduce((acc, i) => acc + i.quantity, 0),
    subtotal: activeItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
    deliveryCost: activeItems.reduce((acc, i) => acc + i.quantity, 0) > 0 ? 0 : 0,
    voucherDiscount,
    total: activeItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0) - voucherDiscount,
  }

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart(product))
    dispatch(showToast({ message: `${product.name} added to basket`, type: 'success' }))
  }

  const handleRemove = (productId: string) => dispatch(removeFromCart(productId))
  const handleUpdateQty = (productId: string, quantity: number) =>
    dispatch(updateQuantity({ productId, quantity }))
  const handleSaveForLater = (productId: string) => dispatch(saveForLater(productId))
  const handleMoveToCart = (productId: string) => dispatch(moveToCart(productId))
  const handleClearCart = () => dispatch(clearCart())

  const isInCart = (productId: string) =>
    items.some((i) => i.product.id === productId && !i.savedForLater)

  return {
    items,
    activeItems,
    savedItems,
    summary,
    voucherCode,
    handleAddToCart,
    handleRemove,
    handleUpdateQty,
    handleSaveForLater,
    handleMoveToCart,
    handleClearCart,
    isInCart,
  }
}
