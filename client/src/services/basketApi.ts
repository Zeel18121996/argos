import { baseApi } from '@/app/baseApi'
import type { Product } from '@/interfaces/product.interface'

export interface BasketItem {
  id: string
  productId: string
  variantId: string | null
  quantity: number
  unitPrice: number
  product: {
    id: string
    name: string
    slug: string
    sku: string
    price: number
    images: string[]
  }
}

export interface BasketResponse {
  id: string
  userId: string | null
  sessionId: string | null
  items: BasketItem[]
  summary: {
    itemCount: number
    subtotal: number
    deliveryCost: number
    total: number
  }
}

export interface AddBasketItemPayload {
  productId: string
  variantId?: string
  quantity: number
}

export const basketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBasket: builder.query<BasketResponse, void>({
      query: () => '/basket',
      providesTags: ['Basket'],
    }),

    addBasketItem: builder.mutation<BasketResponse, AddBasketItemPayload>({
      query: (body) => ({
        url: '/basket/items',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Basket'],
    }),

    updateBasketItem: builder.mutation<BasketResponse, { itemId: string; quantity: number }>({
      query: ({ itemId, quantity }) => ({
        url: `/basket/items/${itemId}`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Basket'],
    }),

    removeBasketItem: builder.mutation<BasketResponse, string>({
      query: (itemId) => ({
        url: `/basket/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Basket'],
    }),

    clearBasket: builder.mutation<BasketResponse, void>({
      query: () => ({
        url: '/basket',
        method: 'DELETE',
      }),
      invalidatesTags: ['Basket'],
    }),

    mergeBasket: builder.mutation<BasketResponse, { guestSessionId?: string }>({
      query: (body) => ({
        url: '/basket/merge',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Basket'],
    }),
  }),
})

export const {
  useGetBasketQuery,
  useAddBasketItemMutation,
  useUpdateBasketItemMutation,
  useRemoveBasketItemMutation,
  useClearBasketMutation,
  useMergeBasketMutation,
} = basketApi
