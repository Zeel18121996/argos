import { baseApi } from '@/app/baseApi'
import type { AuthUser } from '@/features/auth/authSlice'

export interface AuthResult {
  accessToken: string
  user: AuthUser
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  marketingOptIn?: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface MeResponse extends AuthUser {
  phone: string | null
  emailVerified: boolean
  marketingOptIn: boolean
  createdAt: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResult, RegisterPayload>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: builder.mutation<AuthResult, LoginPayload>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    refresh: builder.mutation<AuthResult, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
    }),
    logout: builder.mutation<{ ok: true }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    forgotPassword: builder.mutation<{ ok: true }, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<{ ok: true }, { token: string; password: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    getMe: builder.query<MeResponse, void>({
      query: () => ({ url: '/users/me' }),
      providesTags: ['Me'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi
