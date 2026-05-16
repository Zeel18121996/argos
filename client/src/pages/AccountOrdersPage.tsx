import { Link } from 'react-router-dom'
import { Package, AlertCircle } from 'lucide-react'
import { useGetOrdersQuery } from '@/services/ordersApi'
import { formatPriceFromPounds } from '@/utils/format'
import { formatDate } from '@/utils/format'

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
    <div className="argos-container py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-argos-charcoal mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white border border-argos-border rounded">
          <Package size={48} className="text-argos-gray-light mx-auto mb-3" />
          <p className="text-argos-charcoal font-bold mb-1">No orders yet</p>
          <p className="text-argos-gray text-sm mb-4">
            When you place an order, it will appear here.
          </p>
          <Link to="/" className="text-argos-blue hover:underline text-sm font-bold">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="bg-white border border-argos-border rounded p-4 hover:border-argos-blue transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-argos-charcoal">{order.orderNumber}</span>
                <span className="text-xs font-bold uppercase tracking-wide text-argos-gray bg-argos-gray-bg px-2 py-0.5 rounded">
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-argos-gray">{order.itemCount} items</span>
                <span className="text-argos-red font-bold">
                  {formatPriceFromPounds(order.total / 100)}
                </span>
              </div>
              <p className="text-xs text-argos-gray mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
