import { baseApi } from '../app/baseApi'

export interface AdminUserSummary {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  emailVerified: boolean
  lastLoginAt: string | null
  createdAt: string
}

export interface DashboardStats {
  todayOrders: number
  todayRevenue: number
  totalProducts: number
  totalCustomers: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    status: string
    total: number
    createdAt: string
  }>
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/admin/dashboard/stats',
      providesTags: ['Order'],
    }),

    getAdminUsers: builder.query<
      {
        data: AdminUserSummary[]
        meta: { page: number; limit: number; total: number; totalPages: number }
      },
      { page?: number; limit?: number; q?: string; role?: string; status?: string }
    >({
      query: (params) => ({ url: '/admin/users', params }),
    }),

    getAdminUser: builder.query<AdminUserSummary, string>({
      query: (id) => `/admin/users/${id}`,
    }),

    updateAdminUserRole: builder.mutation<AdminUserSummary, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/admin/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
    }),

    updateAdminUserStatus: builder.mutation<AdminUserSummary, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/admin/users/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
    }),
  }),
})

export const {
  useGetDashboardStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useUpdateAdminUserRoleMutation,
  useUpdateAdminUserStatusMutation,
} = adminApi
