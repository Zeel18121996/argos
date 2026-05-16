import { baseApi } from '@/app/baseApi'
import type { Category } from '@/types/category.types'

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
  }),
})

export const { useGetCategoriesQuery } = categoriesApi
