import { useCallback } from 'react'
import { useAppSelector, useAppDispatch } from './useRedux'
import {
  useGetBasketQuery,
  useAddBasketItemMutation,
  useUpdateBasketItemMutation,
  useRemoveBasketItemMutation,
  useClearBasketMutation,
} from '@/services/basketApi'
import { setBasketDrawerOpen } from '@/features/ui/uiSlice'
import { toast } from 'sonner'
import type { Product } from '@/interfaces/product.interface'

export interface CartSummary {
  itemCount: number
  subtotal: number
  deliveryCost: number
  voucherDiscount: number
  total: number
}

export const useCart = () => {
  const dispatch = useAppDispatch()
  const { data: basket, isLoading } = useGetBasketQuery()
  const [addItem] = useAddBasketItemMutation()
  const [updateItem] = useUpdateBasketItemMutation()
  const [removeItem] = useRemoveBasketItemMutation()
  const [clearBasket] = useClearBasketMutation()

  const voucherDiscount = useAppSelector((s) => s.cart.voucherDiscount) ?? 0

  const items = basket?.items ?? []
  const summary: CartSummary = {
    itemCount: basket?.summary.itemCount ?? 0,
    subtotal: basket?.summary.subtotal ?? 0,
    deliveryCost: 0,
    voucherDiscount,
    total: (basket?.summary.subtotal ?? 0) - voucherDiscount,
  }

  const handleAddToCart = useCallback(
    async (product: Product, quantity = 1) => {
      await addItem({ productId: product.id, quantity }).unwrap()
      toast.success(`${product.name} added to basket`)
      dispatch(setBasketDrawerOpen(true))
    },
    [addItem, dispatch],
  )

  const handleRemove = useCallback(
    async (productId: string) => {
      const item = items.find((i) => i.productId === productId)
      if (item) await removeItem(item.id).unwrap()
    },
    [items, removeItem],
  )

  const handleUpdateQty = useCallback(
    async (productId: string, quantity: number) => {
      const item = items.find((i) => i.productId === productId)
      if (item) await updateItem({ itemId: item.id, quantity }).unwrap()
    },
    [items, updateItem],
  )

  const handleClearCart = useCallback(async () => {
    await clearBasket().unwrap()
  }, [clearBasket])

  const isInCart = (productId: string) => items.some((i) => i.productId === productId)

  return {
    items,
    summary,
    isLoading,
    handleAddToCart,
    handleRemove,
    handleUpdateQty,
    handleClearCart,
    isInCart,
  }
}
