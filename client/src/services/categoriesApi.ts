import { baseApi } from '@/app/baseApi'
import type { Category } from '@/types/category.types'

export interface CategoryFormPayload {
  slug: string
  name: string
  parentId?: string | null
  sortOrder?: number
  imageUrl?: string | null
}

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),

    getAdminCategories: builder.query<Category[], void>({
      query: () => '/admin/categories',
      providesTags: ['Category'],
    }),

    createCategory: builder.mutation<Category, CategoryFormPayload>({
      query: (body) => ({ url: '/categories', method: 'POST', body }),
      invalidatesTags: ['Category'],
    }),

    updateCategory: builder.mutation<Category, { id: string; body: Partial<CategoryFormPayload> }>({
      query: ({ id, body }) => ({ url: `/categories/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Category'],
    }),

    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category'],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi
