import { baseApi } from '@/app/baseApi'

export interface WishlistItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    slug: string
    sku: string
    price: number
    images: string[]
    inStock: boolean
  }
}

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<WishlistItem[], void>({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),

    addWishlistItem: builder.mutation<WishlistItem[], string>({
      query: (productId) => ({
        url: '/wishlist/items',
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: ['Wishlist'],
    }),

    removeWishlistItem: builder.mutation<WishlistItem[], string>({
      query: (productId) => ({
        url: `/wishlist/items/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
})

export const { useGetWishlistQuery, useAddWishlistItemMutation, useRemoveWishlistItemMutation } =
  wishlistApi
