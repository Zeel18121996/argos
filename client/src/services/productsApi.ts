import { baseApi } from '@/app/baseApi'
import type {
  Product,
  ProductListParams,
  ProductListResponse,
} from '@/interfaces/product.interface'

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResponse, ProductListParams>({
      query: (params) => {
        const { brand, ...rest } = params
        return {
          url: '/products',
          params: {
            ...rest,
            ...(brand ? { brands: [brand] } : {}),
          },
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProductBySlug: builder.query<Product, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Product', id: slug }],
    }),

    getFeaturedProducts: builder.query<Product[], void>({
      query: () => ({
        url: '/products',
        params: { isFeatured: true, limit: 12 },
      }),
      transformResponse: (response: ProductListResponse) => response.items,
      providesTags: [{ type: 'Product', id: 'FEATURED' }],
    }),

    getNewProducts: builder.query<Product[], void>({
      query: () => ({
        url: '/products',
        params: { isNew: true, limit: 12 },
      }),
      transformResponse: (response: ProductListResponse) => response.items,
      providesTags: [{ type: 'Product', id: 'NEW' }],
    }),

    getSaleProducts: builder.query<Product[], void>({
      query: () => ({
        url: '/products',
        params: { onOffer: true, limit: 12 },
      }),
      transformResponse: (response: ProductListResponse) => response.items,
      providesTags: [{ type: 'Product', id: 'SALE' }],
    }),

    getBigDealProducts: builder.query<Product[], { limit?: number } | void>({
      query: (arg) => ({
        url: '/products',
        params: { isBigDeal: true, limit: arg?.limit ?? 24 },
      }),
      transformResponse: (response: ProductListResponse) => response.items,
      providesTags: [{ type: 'Product', id: 'BIG_DEAL' }],
    }),

    /** Fetch a set of products by slug — used for "Pick up where you left off". */
    getProductsBySlugs: builder.query<Product[], string[]>({
      query: (slugs) => ({
        url: '/products',
        params: { slugs: slugs.join(','), limit: slugs.length },
      }),
      transformResponse: (response: ProductListResponse) => response.items,
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: 'Product' as const, id }))
          : [{ type: 'Product', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetFeaturedProductsQuery,
  useGetNewProductsQuery,
  useGetSaleProductsQuery,
  useGetBigDealProductsQuery,
  useGetProductsBySlugsQuery,
} = productsApi
