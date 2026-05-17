import { baseApi } from '../app/baseApi'
import type { Paginated } from '../types/api'

export interface OrderItem {
  id: string
  productId: string
  variantId: string | null
  productName: string
  variantName: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  product: {
    id: string
    name: string
    slug: string
    sku: string
    price: number
    images: string[]
  } | null
}

export interface OrderSummary {
  id: string
  orderNumber: string
  status: string
  total: number
  itemCount: number
  createdAt: string
}

export interface OrderDetail extends OrderSummary {
  subtotal: number
  deliveryCost: number
  discountAmount: number
  paymentStatus: string
  deliveryMethod: string | null
  deliveryAddress: Record<string, unknown> | null
  trackingNumber: string | null
  items: OrderItem[]
  guestEmail: string | null
}

export interface CreateCheckoutPayload {
  line1: string
  line2?: string
  city: string
  postcode: string
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  deliveryMethod: 'standard' | 'next_day' | 'click_collect'
}

export interface VerifyCheckoutPayload extends CreateCheckoutPayload {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface CreatePaymentResponse {
  razorpayOrderId: string
  amount: number
  currency: string
  keyId: string
  prefill: {
    name: string
    email: string
    contact: string
  }
}

export interface TrackParams {
  orderNumber: string
  postcode: string
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Paginated<OrderSummary>, { page?: number; limit?: number }>({
      query: (params) => ({ url: '/orders', params }),
      providesTags: ['Order'],
    }),

    getOrder: builder.query<OrderDetail, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Order', id }],
    }),

    createPayment: builder.mutation<CreatePaymentResponse, CreateCheckoutPayload>({
      query: (body) => ({ url: '/checkout/create-payment', method: 'POST', body }),
    }),

    verifyPayment: builder.mutation<
      { orderId: string; orderNumber: string; status: string; total: number },
      VerifyCheckoutPayload
    >({
      query: (body) => ({ url: '/checkout/verify', method: 'POST', body }),
      invalidatesTags: ['Basket', 'Order'],
    }),

    cancelOrder: builder.mutation<OrderDetail, string>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: (_result, _err, id) => [{ type: 'Order', id }],
    }),

    getAdminOrders: builder.query<
      Paginated<OrderSummary>,
      { page?: number; limit?: number; status?: string; q?: string }
    >({
      query: (params) => ({ url: '/orders/admin/orders', params }),
      providesTags: ['Order'],
    }),

    updateAdminOrderStatus: builder.mutation<
      OrderDetail,
      { id: string; next: string; trackingNumber?: string; note?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/orders/admin/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Order', id }],
    }),

    trackOrder: builder.query<{ status: string; trackingNumber: string | null }, TrackParams>({
      query: (params) => ({ url: '/orders/track', params }),
    }),
  }),
})

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
  useCancelOrderMutation,
  useTrackOrderQuery,
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
} = ordersApi
