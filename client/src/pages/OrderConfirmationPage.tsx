import { Link, useParams } from 'react-router-dom'
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react'
import { useGetOrderQuery } from '@/services/ordersApi'
import { formatPriceFromPounds } from '@/utils/format'
import { resolveImageUrl } from '@/utils/imageUrl'

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: order, isLoading, error } = useGetOrderQuery(orderId ?? '', { skip: !orderId })

  if (isLoading) {
    return (
      <div className="argos-container py-16 text-center">
        <div className="w-10 h-10 border-2 border-argos-red border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-argos-gray">Loading order details…</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="argos-container py-16 text-center max-w-lg mx-auto">
        <AlertCircle size={48} className="text-argos-red mx-auto mb-3" />
        <h2 className="text-xl font-bold text-argos-charcoal mb-2">Could not load order</h2>
        <p className="text-argos-gray mb-4">
          This can happen if the order was placed before a recent server update. Please check your
          order history.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/account/orders"
            className="inline-flex items-center justify-center gap-2 bg-argos-blue text-white font-bold px-6 py-3 rounded hover:bg-argos-blue-dark transition-colors"
          >
            <ArrowRight size={16} />
            View your orders
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 border border-argos-gray-light text-argos-charcoal font-bold px-6 py-3 rounded hover:bg-argos-gray-bg transition-colors"
          >
            <ShoppingBag size={16} />
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="argos-container py-10 max-w-2xl mx-auto">
      <div className="bg-white border border-argos-border rounded p-8 text-center">
        <CheckCircle size={64} className="text-argos-green mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-argos-charcoal mb-1">Order placed successfully!</h1>
        <p className="text-argos-gray mb-6">
          Thank you for your order. A confirmation email has been sent.
        </p>

        <div className="bg-argos-gray-bg rounded p-4 text-left mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-argos-gray">Order number</span>
            <span className="font-bold text-argos-charcoal">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-argos-gray">Status</span>
            <span className="font-bold text-argos-charcoal capitalize">{order.status}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-argos-gray">Total</span>
            <span className="font-bold text-argos-red">
              {formatPriceFromPounds(order.total / 100)}
            </span>
          </div>
        </div>

        <div className="text-left mb-6">
          <h2 className="text-sm font-bold text-argos-charcoal mb-3">Items ordered</h2>
          <div className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-white border border-argos-border rounded overflow-hidden flex-shrink-0">
                  <img
                    src={resolveImageUrl(item.product?.images?.[0] ?? '')}
                    alt={item.productName}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-argos-charcoal line-clamp-1">
                    {item.productName}
                  </p>
                  {item.variantName && (
                    <p className="text-xs text-argos-gray">{item.variantName}</p>
                  )}
                  <p className="text-xs text-argos-gray">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-bold text-argos-charcoal">
                  {formatPriceFromPounds(item.totalPrice / 100)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-argos-blue text-white font-bold px-6 py-3 rounded hover:bg-argos-blue-dark transition-colors"
          >
            <ShoppingBag size={16} />
            Continue shopping
          </Link>
          <Link
            to="/account/orders"
            className="inline-flex items-center justify-center gap-2 border border-argos-gray-light text-argos-charcoal font-bold px-6 py-3 rounded hover:bg-argos-gray-bg transition-colors"
          >
            View your orders
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
