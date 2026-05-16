import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import type { RootState } from './store'

// ── Raw fetch query ────────────────────────────────────────────────────────────
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) headers.set('authorization', `Bearer ${token}`)
    return headers
  },
})

/**
 * Our NestJS server wraps every success response in:
 *   { data: <actual payload>, message: 'OK', timestamp: '...' }
 *
 * This custom baseQuery unwraps that envelope so every RTK Query hook
 * receives the actual payload directly (e.g. Category[] not { data: Category[] }).
 */
const baseQueryWithUnwrap: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions)

  if (result.data && typeof result.data === 'object' && 'data' in result.data) {
    // Unwrap: return the inner `data` field as the query result
    return { ...result, data: (result.data as { data: unknown }).data }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithUnwrap,
  tagTypes: [
    'Product',
    'Category',
    'Basket',
    'Order',
    'Review',
    'Wishlist',
    'User',
    'Promotion',
    'Store',
    'Help',
  ],
  endpoints: () => ({}), // endpoints injected per feature
})
