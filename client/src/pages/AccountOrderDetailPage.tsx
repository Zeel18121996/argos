import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, AlertCircle, XCircle } from 'lucide-react'
import { useGetOrderQuery, useCancelOrderMutation } from '@/services/ordersApi'
import { formatPriceFromPounds } from '@/utils/format'
import { resolveImageUrl } from '@/utils/imageUrl'
import { toast } from 'sonner'

export default function AccountOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading, error } = useGetOrderQuery(id ?? '', { skip: !id })
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation()

  const canCancel = order && ['pending', 'confirmed', 'processing'].includes(order.status)

  const handleCancel = async () => {
    if (!id) return
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    try {
      await cancelOrder(id).unwrap()
      toast.success('Order cancelled')
    } catch {
      toast.error('Failed to cancel order')
    }
  }

  if (isLoading) {
    return (
      <div className="argos-container py-10">
        <div className="animate-pulse max-w-2xl mx-auto space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="argos-container py-16 text-center">
        <AlertCircle size={40} className="text-argos-red mx-auto mb-3" />
        <p className="text-argos-gray">Order not found or failed to load.</p>
        <Link
          to="/account/orders"
          className="text-argos-blue hover:underline text-sm mt-2 inline-block"
        >
          Back to orders
        </Link>
      </div>
    )
  }

  return (
    <div className="argos-container py-8 max-w-3xl mx-auto">
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-1 text-sm text-argos-blue hover:underline mb-4"
      >
        <ArrowLeft size={14} />
        Back to orders
      </Link>

      <div className="bg-white border border-argos-border rounded p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-argos-charcoal">{order.orderNumber}</h1>
          <span className="text-xs font-bold uppercase tracking-wide text-argos-gray bg-argos-gray-bg px-2 py-0.5 rounded">
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-6">
          <div>
            <p className="text-argos-gray text-xs mb-0.5">Order date</p>
            <p className="font-bold text-argos-charcoal">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-argos-gray text-xs mb-0.5">Total</p>
            <p className="font-bold text-argos-red">{formatPriceFromPounds(order.total / 100)}</p>
          </div>
          <div>
            <p className="text-argos-gray text-xs mb-0.5">Payment</p>
            <p className="font-bold text-argos-charcoal capitalize">{order.paymentStatus}</p>
          </div>
        </div>

        {canCancel && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-argos-red border border-argos-red px-4 py-2 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <XCircle size={16} />
              {isCancelling ? 'Cancelling…' : 'Cancel order'}
            </button>
          </div>
        )}

        {order.trackingNumber && (
          <div className="bg-argos-blue-light rounded p-3 mb-4">
            <p className="text-sm font-bold text-argos-charcoal">Tracking number</p>
            <p className="text-sm text-argos-blue">{order.trackingNumber}</p>
          </div>
        )}

        <h2 className="text-sm font-bold text-argos-charcoal mb-3">Items</h2>
        <div className="flex flex-col gap-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 items-center border-b border-argos-border last:border-0 pb-3 last:pb-0"
            >
              <div className="w-14 h-14 bg-white border border-argos-border rounded overflow-hidden flex-shrink-0">
                <img
                  src={resolveImageUrl(item.product?.images?.[0] ?? '')}
                  alt={item.productName}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-argos-charcoal">{item.productName}</p>
                {item.variantName && <p className="text-xs text-argos-gray">{item.variantName}</p>}
                <p className="text-xs text-argos-gray">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-bold text-argos-charcoal">
                {formatPriceFromPounds(item.totalPrice / 100)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-argos-border mt-4 pt-4 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-argos-gray">Subtotal</span>
            <span className="text-argos-charcoal">
              {formatPriceFromPounds(order.subtotal / 100)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-argos-gray">Delivery</span>
            <span className="text-argos-charcoal">
              {order.deliveryCost === 0 ? 'Free' : formatPriceFromPounds(order.deliveryCost / 100)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span>Total</span>
            <span className="text-argos-red">{formatPriceFromPounds(order.total / 100)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
