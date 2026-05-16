import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import type { RootState } from './store'
import { clearAuth, setAuth, type AuthUser } from '@/features/auth/authSlice'

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
 * This custom baseQuery:
 *   1. unwraps that envelope so RTK Query hooks see the inner payload directly
 *   2. on 401 from a non-/auth endpoint, silently calls /auth/refresh once,
 *      stores the new accessToken, and retries the original request once.
 */
let refreshPromise: Promise<{ accessToken: string; user: AuthUser } | null> | null = null

async function attemptRefresh(
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<{ accessToken: string; user: AuthUser } | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshResult = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions,
      )
      const payload =
        refreshResult.data && typeof refreshResult.data === 'object' && 'data' in refreshResult.data
          ? (refreshResult.data as { data: { accessToken: string; user: AuthUser } }).data
          : (refreshResult.data as { accessToken: string; user: AuthUser } | undefined)
      if (!payload?.accessToken || !payload?.user) return null
      return payload
    })().finally(() => {
      // Allow subsequent calls to trigger a new refresh after this one finishes.
      setTimeout(() => {
        refreshPromise = null
      }, 0)
    })
  }
  return refreshPromise
}

function isAuthEndpoint(args: string | FetchArgs): boolean {
  const url = typeof args === 'string' ? args : args.url
  return url.startsWith('/auth') || url.startsWith('auth/')
}

const baseQueryWithUnwrap: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  // 401 → try silent refresh, then retry the original request once.
  // Skip refresh for /auth/* endpoints to avoid loops.
  if (result.error?.status === 401 && !isAuthEndpoint(args)) {
    const refreshed = await attemptRefresh(api, extraOptions)
    if (refreshed) {
      api.dispatch(setAuth({ user: refreshed.user, accessToken: refreshed.accessToken }))
      result = await rawBaseQuery(args, api, extraOptions)
    } else {
      // Refresh failed → clear auth state. Route guards will redirect.
      api.dispatch(clearAuth())
    }
  }

  if (result.data && typeof result.data === 'object' && 'data' in result.data) {
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
    'Me',
    'Address',
    'Promotion',
    'Store',
    'Help',
    'AdminUser',
  ],
  endpoints: () => ({}), // endpoints injected per feature
})
