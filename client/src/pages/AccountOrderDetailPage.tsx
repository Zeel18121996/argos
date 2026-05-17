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
    <div className="page-container py-10 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-1.5 text-base text-argos-blue hover:underline mb-6"
      >
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      <div className="bg-white border border-argos-border rounded-sm p-8">
        {/* Header: order number + status */}
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-xl font-bold text-argos-charcoal">{order.orderNumber}</h1>
          <span
            className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm ${
              order.status.toLowerCase() === 'cancelled'
                ? 'bg-red-50 text-argos-red'
                : 'bg-argos-green-light text-argos-green-dark'
            }`}
          >
            {order.status}
          </span>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 pb-6 border-b border-argos-border">
          <div>
            <p className="text-sm text-argos-gray mb-1">Order date</p>
            <p className="text-base font-bold text-argos-charcoal">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-argos-gray mb-1">Total</p>
            <p className="text-base font-bold text-argos-red">
              {formatPriceFromPounds(order.total / 100)}
            </p>
          </div>
          <div>
            <p className="text-sm text-argos-gray mb-1">Payment</p>
            <p className="text-base font-bold text-argos-charcoal capitalize">
              {order.paymentStatus}
            </p>
          </div>
        </div>

        {/* Cancel button */}
        {canCancel && (
          <div className="flex justify-end mb-6">
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="inline-flex items-center gap-2 text-base font-bold text-argos-red border border-argos-red px-5 py-2.5 rounded-sm hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <XCircle size={18} />
              {isCancelling ? 'Cancelling…' : 'Cancel order'}
            </button>
          </div>
        )}

        {/* Tracking */}
        {order.trackingNumber && (
          <div className="bg-argos-blue-light rounded-sm p-4 mb-6">
            <p className="text-base font-bold text-argos-charcoal mb-0.5">Tracking number</p>
            <p className="text-base text-argos-blue">{order.trackingNumber}</p>
          </div>
        )}

        {/* Items */}
        <h2 className="text-base font-bold text-argos-charcoal mb-4">Items</h2>
        <div className="flex flex-col divide-y divide-argos-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 items-center py-4 first:pt-0 last:pb-0">
              <div className="w-16 h-16 bg-white border border-argos-border rounded overflow-hidden flex-shrink-0">
                <img
                  src={resolveImageUrl(item.product?.images?.[0] ?? '')}
                  alt={item.productName}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-argos-charcoal leading-snug">
                  {item.productName}
                </p>
                {item.variantName && (
                  <p className="text-sm text-argos-gray mt-0.5">{item.variantName}</p>
                )}
                <p className="text-sm text-argos-gray mt-1">Qty: {item.quantity}</p>
              </div>
              <span className="text-base font-bold text-argos-charcoal flex-shrink-0">
                {formatPriceFromPounds(item.totalPrice / 100)}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing summary */}
        <div className="border-t border-argos-border mt-6 pt-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-base text-argos-gray">Subtotal</span>
            <span className="text-base text-argos-charcoal">
              {formatPriceFromPounds(order.subtotal / 100)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base text-argos-gray">Delivery</span>
            <span className="text-base text-argos-charcoal">
              {order.deliveryCost === 0 ? 'Free' : formatPriceFromPounds(order.deliveryCost / 100)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-argos-border">
            <span className="text-lg font-bold text-argos-charcoal">Total</span>
            <span className="text-xl font-bold text-argos-red">
              {formatPriceFromPounds(order.total / 100)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
