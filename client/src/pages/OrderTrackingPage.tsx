import { useState } from 'react'
import { Search, Package, AlertCircle, CheckCircle, Truck, Home } from 'lucide-react'
import { useTrackOrderQuery } from '@/services/ordersApi'
import { cn } from '@/utils/cn'

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [postcode, setPostcode] = useState('')
  const [shouldFetch, setShouldFetch] = useState(false)

  const { data, isFetching, error } = useTrackOrderQuery(
    { orderNumber, postcode },
    { skip: !shouldFetch || !orderNumber || !postcode },
  )

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    setShouldFetch(true)
  }

  const statusSteps = [
    { label: 'Confirmed', icon: CheckCircle },
    { label: 'Processing', icon: Package },
    { label: 'Shipped', icon: Truck },
    { label: 'Delivered', icon: Home },
  ]

  const currentStepIndex = statusSteps.findIndex(
    (s) => s.label.toLowerCase() === (data?.status ?? '').toLowerCase(),
  )

  return (
    <div className="argos-container py-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-argos-charcoal mb-6">Track your order</h1>

      <form onSubmit={handleTrack} className="bg-white border border-argos-border rounded p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-bold text-argos-charcoal block mb-1">Order number</label>
            <input
              value={orderNumber}
              onChange={(e) => {
                setOrderNumber(e.target.value)
                setShouldFetch(false)
              }}
              className="w-full border border-argos-gray-light rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-argos-blue"
              placeholder="e.g. ORD-123456789"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-argos-charcoal block mb-1">
              Delivery postcode
            </label>
            <input
              value={postcode}
              onChange={(e) => {
                setPostcode(e.target.value)
                setShouldFetch(false)
              }}
              className="w-full border border-argos-gray-light rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-argos-blue"
              placeholder="e.g. EC1A 1BB"
            />
          </div>
          <button
            type="submit"
            disabled={isFetching || !orderNumber || !postcode}
            className="bg-argos-blue text-white font-bold py-3 px-6 rounded hover:bg-argos-blue-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Search size={16} />
            {isFetching ? 'Tracking…' : 'Track order'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded flex items-center gap-2">
          <AlertCircle size={16} />
          Order not found. Please check your order number and postcode.
        </div>
      )}

      {data && (
        <div className="bg-white border border-argos-border rounded p-6">
          <h2 className="text-lg font-bold text-argos-charcoal mb-4">Order status</h2>

          <div className="flex items-center justify-between mb-6">
            {statusSteps.map((s, i) => {
              const Icon = s.icon
              const active = i <= currentStepIndex
              return (
                <div key={s.label} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      active ? 'bg-argos-green text-white' : 'bg-argos-gray-bg text-argos-gray',
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <span
                    className={cn(
                      'text-xs font-bold',
                      active ? 'text-argos-charcoal' : 'text-argos-gray',
                    )}
                  >
                    {s.label}
                  </span>
                  {i < statusSteps.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 w-full mt-1',
                        i < currentStepIndex ? 'bg-argos-green' : 'bg-argos-gray-bg',
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {data.trackingNumber && (
            <div className="bg-argos-blue-light rounded p-3">
              <p className="text-sm font-bold text-argos-charcoal">Tracking number</p>
              <p className="text-sm text-argos-blue">{data.trackingNumber}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
