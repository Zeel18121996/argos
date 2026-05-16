import { baseApi } from '@/app/baseApi'
import type { Product, ProductListResponse } from '@/interfaces/product.interface'

export interface CreateProductPayload {
  name: string
  slug: string
  sku: string
  brand?: string
  description?: string
  categoryId: string
  price: number
  compareAtPrice?: number
  stockCount: number
  features?: string[]
  specifications?: Array<{ name: string; value: string }>
  deliveryOptions?: Array<{ type: string; label: string; price: number; availableFrom?: string }>
  isActive?: boolean
  isFeatured?: boolean
  isOnOffer?: boolean
  isNew?: boolean
  isClearance?: boolean
  reserveAvailable?: boolean
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export const adminProductsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminProducts: builder.query<
      ProductListResponse,
      {
        page?: number
        limit?: number
        q?: string
        categoryId?: string
        brand?: string
        sortBy?: string
      }
    >({
      query: (params) => ({
        url: '/admin/products',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Product', id: 'ADMIN_LIST' }],
    }),

    getAdminProduct: builder.query<Product, string>({
      query: (id) => `/admin/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    createAdminProduct: builder.mutation<Product, CreateProductPayload>({
      query: (body) => ({
        url: '/admin/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Product', id: 'ADMIN_LIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    updateAdminProduct: builder.mutation<Product, { id: string; body: UpdateProductPayload }>({
      query: ({ id, body }) => ({
        url: `/admin/products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'ADMIN_LIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteAdminProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Product', id: 'ADMIN_LIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    uploadProductImages: builder.mutation<
      { data: Array<{ id: string; url: string; altText: string | null; sortOrder: number }> },
      { productId: string; files: File[] }
    >({
      query: ({ productId, files }) => {
        const formData = new FormData()
        files.forEach((file) => formData.append('images', file))
        return {
          url: `/admin/products/${productId}/images`,
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'Product', id: productId }],
    }),

    deleteProductImage: builder.mutation<void, { productId: string; imageId: string }>({
      query: ({ productId, imageId }) => ({
        url: `/admin/products/${productId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'Product', id: productId }],
    }),
  }),
})

export const {
  useGetAdminProductsQuery,
  useGetAdminProductQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
} = adminProductsApi
