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
  }),
})

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetFeaturedProductsQuery,
  useGetNewProductsQuery,
  useGetSaleProductsQuery,
} = productsApi
