import { Link } from 'react-router-dom'
import { Package, AlertCircle } from 'lucide-react'
import { useGetOrdersQuery } from '@/services/ordersApi'
import { formatPriceFromPounds, formatDateTime } from '@/utils/format'

export default function AccountOrdersPage() {
  const { data, isLoading, error } = useGetOrdersQuery({ page: 1, limit: 30 })

  if (isLoading) {
    return (
      <div className="argos-container py-10">
        <div className="animate-pulse space-y-4 max-w-2xl">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="argos-container py-16 text-center">
        <AlertCircle size={40} className="text-argos-red mx-auto mb-3" />
        <p className="text-argos-gray">Failed to load orders. Please try again.</p>
      </div>
    )
  }

  const orders = data?.data ?? []

  return (
    <div className="page-container py-10 max-w-3xl mx-auto">
      <h1 className="text-[28px] font-bold text-argos-charcoal mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-argos-border rounded-sm">
          <Package size={56} className="text-argos-gray-light mx-auto mb-4" />
          <p className="text-lg font-bold text-argos-charcoal mb-2">No orders yet</p>
          <p className="text-base text-argos-gray mb-6">
            When you place an order, it will appear here.
          </p>
          <Link to="/" className="text-base text-argos-blue hover:underline font-bold">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="bg-white border border-argos-border rounded-sm px-6 py-5 hover:border-argos-blue transition-colors block"
            >
              {/* Order number + status */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-bold text-argos-charcoal">
                  {order.orderNumber}
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm ${
                    order.status === 'CANCELLED'
                      ? 'bg-red-50 text-argos-red'
                      : 'bg-argos-green-light text-argos-green-dark'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Items + total */}
              <div className="flex items-center justify-between">
                <span className="text-base text-argos-gray">
                  {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-lg font-bold text-argos-red">
                  {formatPriceFromPounds(order.total / 100)}
                </span>
              </div>

              {/* Date + time */}
              <p className="text-sm text-argos-gray mt-2">
                Placed on {formatDateTime(order.createdAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
