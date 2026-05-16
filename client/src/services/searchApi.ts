import { baseApi } from '@/app/baseApi'
import type { ProductListResponse } from '@/interfaces/product.interface'

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchProducts: builder.query<
      ProductListResponse,
      { q: string; page?: number; limit?: number; sortBy?: string }
    >({
      query: ({ q, page = 1, limit = 24, sortBy }) => ({
        url: '/search',
        params: { q, page, limit, sortBy },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
  }),
})

export const { useSearchProductsQuery } = searchApi
