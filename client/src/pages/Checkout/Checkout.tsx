import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, ChevronRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPriceFromPounds } from '@/utils/format'
import { PATHS } from '@/constants/path'
import { cn } from '@/utils/cn'

type Step = 'delivery' | 'payment' | 'confirmation'

const STEPS: { id: Step; label: string }[] = [
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
  { id: 'confirmation', label: 'Confirmation' },
]

const Checkout: React.FC = () => {
  const { activeItems, summary, handleClearCart } = useCart()

  // Component state
  const [step, setStep] = useState<Step>('delivery')
  const [address, setAddress] = useState({
    line1: '',
    city: '',
    postcode: '',
  })
  const [cardNumber, setCardNumber] = useState('')
  const [orderNumber] = useState(`ARG-${Math.floor(100000 + Math.random() * 900000)}`)

  const handlePlaceOrder = () => {
    setStep('confirmation')
    handleClearCart()
  }

  if (activeItems.length === 0 && step !== 'confirmation') {
    return (
      <div className="argos-container py-20 text-center">
        <h2 className="text-xl font-bold text-argos-charcoal mb-2">Your basket is empty</h2>
        <Link to={PATHS.BASKET} className="text-argos-blue hover:underline">
          View basket
        </Link>
      </div>
    )
  }

  return (
    <div className="argos-container py-6 max-w-4xl">
      {/* Progress bar */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => {
          const stepIdx = STEPS.findIndex((x) => x.id === step)
          const isDone = i < stepIdx
          const isActive = s.id === step
          return (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                    isDone
                      ? 'bg-argos-green text-white'
                      : isActive
                        ? 'bg-argos-red text-white'
                        : 'bg-argos-gray-light text-argos-gray',
                  )}
                >
                  {isDone ? '✓' : i + 1}
                </div>
                <span
                  className={cn(
                    'text-sm font-bold hidden sm:block',
                    isActive ? 'text-argos-charcoal' : 'text-argos-gray-mid',
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-3',
                    i < stepIdx ? 'bg-argos-green' : 'bg-argos-border',
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Step content */}
        <div className="bg-white border border-argos-border rounded p-6">
          {step === 'delivery' && (
            <div>
              <h2 className="text-lg font-bold text-argos-charcoal mb-5">Delivery address</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-bold text-argos-charcoal block mb-1">
                    Address line 1 <span className="text-argos-red">*</span>
                  </label>
                  <input
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    className="w-full border border-argos-gray-light rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-argos-blue"
                    placeholder="House number and street name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-argos-charcoal block mb-1">
                      Town / City <span className="text-argos-red">*</span>
                    </label>
                    <input
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full border border-argos-gray-light rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-argos-blue"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-argos-charcoal block mb-1">
                      Postcode <span className="text-argos-red">*</span>
                    </label>
                    <input
                      value={address.postcode}
                      onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
                      className="w-full border border-argos-gray-light rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-argos-blue"
                      placeholder="e.g. EC1A 1BB"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setStep('payment')}
                  disabled={!address.line1 || !address.city || !address.postcode}
                  className="bg-argos-blue text-white font-bold py-3 px-8 rounded hover:bg-argos-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 w-fit"
                >
                  Continue to payment
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div>
              <h2 className="text-lg font-bold text-argos-charcoal mb-5">Payment details</h2>
              <div className="flex flex-col gap-4 max-w-sm">
                <div>
                  <label className="text-sm font-bold text-argos-charcoal block mb-1">
                    Card number
                  </label>
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full border border-argos-gray-light rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-argos-blue"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-argos-charcoal block mb-1">
                      Expiry date
                    </label>
                    <input
                      className="w-full border border-argos-gray-light rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-argos-blue"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-argos-charcoal block mb-1">CVV</label>
                    <input
                      className="w-full border border-argos-gray-light rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-argos-blue"
                      placeholder="123"
                      maxLength={3}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('delivery')}
                    className="border border-argos-gray-light text-argos-charcoal font-bold py-3 px-6 rounded hover:bg-argos-gray-bg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="bg-argos-blue text-white font-bold py-3 px-8 rounded hover:bg-argos-blue-dark transition-colors flex items-center gap-2"
                  >
                    Place order — {formatPriceFromPounds(summary.total)}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="text-center py-8">
              <CheckCircle size={60} className="text-argos-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-argos-charcoal mb-2">Order placed!</h2>
              <p className="text-argos-gray mb-1">Thank you for your order.</p>
              <p className="text-sm font-bold text-argos-charcoal mb-6">
                Order number: {orderNumber}
              </p>
              <p className="text-sm text-argos-gray mb-8">
                Your order will be delivered to{' '}
                <strong>
                  {address.line1}, {address.postcode}
                </strong>
                .<br />
                Expected delivery: <strong>Thu 16 May – Fri 17 May</strong>
              </p>
              <Link
                to={PATHS.HOME}
                className="inline-block bg-argos-blue text-white font-bold px-8 py-3 rounded hover:bg-argos-blue-dark transition-colors"
              >
                Continue shopping
              </Link>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        {step !== 'confirmation' && (
          <div className="bg-white border border-argos-border rounded p-4 h-fit">
            <h3 className="text-sm font-bold text-argos-charcoal mb-4 pb-3 border-b border-argos-border">
              Order summary ({activeItems.length} items)
            </h3>
            <div className="flex flex-col gap-3 mb-4">
              {activeItems.map((item) => (
                <div key={item.product.id} className="flex gap-2 items-start">
                  <div className="w-12 h-12 bg-argos-gray-bg rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-argos-charcoal line-clamp-2">{item.product.name}</p>
                    <p className="text-xs text-argos-gray-mid">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-argos-charcoal flex-shrink-0">
                    {formatPriceFromPounds(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-argos-border pt-3">
              <div className="flex justify-between text-sm font-bold">
                <span>Total</span>
                <span className="text-argos-red">{formatPriceFromPounds(summary.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Checkout
