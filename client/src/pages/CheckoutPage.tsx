import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  MapPin,
  AlertCircle,
} from 'lucide-react'
import { useGetBasketQuery } from '@/services/basketApi'
import { useCreatePaymentMutation, useVerifyPaymentMutation } from '@/services/ordersApi'
import { formatPriceFromPounds } from '@/utils/format'
import { resolveImageUrl } from '@/utils/imageUrl'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

type Step = 'delivery' | 'payment' | 'confirmation'

const STEPS: { id: Step; label: string; icon: typeof MapPin }[] = [
  { id: 'delivery', label: 'Delivery', icon: MapPin },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'confirmation', label: 'Confirmation', icon: CheckCircle },
]

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard delivery', eta: '3-5 working days', cost: 4900 },
  { id: 'next_day', label: 'Next day delivery', eta: 'Order by 8pm', cost: 9900 },
  { id: 'click_collect', label: 'Click & Collect', eta: 'Collect in store', cost: 0 },
] as const

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { data: basket, isLoading: basketLoading } = useGetBasketQuery()
  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation()
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation()

  const [step, setStep] = useState<Step>('delivery')
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    line1: '',
    line2: '',
    city: '',
    postcode: '',
    phone: '',
    email: '',
  })
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'next_day' | 'click_collect'>(
    'standard',
  )
  const [paymentError, setPaymentError] = useState('')

  const items = basket?.items ?? []
  const subtotal = basket?.summary.subtotal ?? 0
  const deliveryCost = DELIVERY_OPTIONS.find((d) => d.id === deliveryMethod)?.cost ?? 4900
  const total = subtotal + deliveryCost

  const canContinueDelivery = address.line1 && address.city && address.postcode

  const isProcessing = isCreatingPayment || isVerifying

  if (basketLoading) {
    return (
      <div className="argos-container py-10">
        <div className="animate-pulse max-w-4xl mx-auto space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="argos-container py-20 text-center">
        <h2 className="text-xl font-bold text-argos-charcoal mb-2">Your basket is empty</h2>
        <Link to="/basket" className="text-argos-blue hover:underline">
          Return to basket
        </Link>
      </div>
    )
  }

  const handlePlaceOrder = async () => {
    setPaymentError('')

    if (typeof window.Razorpay !== 'function') {
      const msg = 'Payment library failed to load. Refresh the page and try again.'
      setPaymentError(msg)
      toast.error(msg)
      return
    }

    const addressPayload = {
      line1: address.line1,
      line2: address.line2 || undefined,
      city: address.city,
      postcode: address.postcode,
      firstName: address.firstName || undefined,
      lastName: address.lastName || undefined,
      phone: address.phone || undefined,
      email: address.email || undefined,
      deliveryMethod,
    }

    try {
      const rzpOrder = await createPayment(addressPayload).unwrap()

      const razorpay = new window.Razorpay({
        key: rzpOrder.keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Argos',
        description: 'Order payment',
        order_id: rzpOrder.razorpayOrderId,
        prefill: rzpOrder.prefill,
        theme: { color: '#D42114' },
        modal: {
          ondismiss: () => {
            setPaymentError('Payment was cancelled. You can try again.')
          },
        },
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              ...addressPayload,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }).unwrap()
            setStep('confirmation')
            navigate(`/checkout/confirmation/${result.orderId}`, { replace: true })
          } catch (err: any) {
            const msg = err?.data?.message ?? err?.message ?? 'Could not confirm payment.'
            setPaymentError(msg)
            toast.error(msg)
          }
        },
      })

      razorpay.open()
    } catch (err: any) {
      const msg = err?.data?.message ?? err?.message ?? 'Could not start payment. Please try again.'
      setPaymentError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="argos-container py-6 max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => {
          const stepIdx = STEPS.findIndex((x) => x.id === step)
          const isDone = i < stepIdx
          const isActive = s.id === step
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    isDone
                      ? 'bg-argos-green text-white'
                      : isActive
                        ? 'bg-argos-red text-white'
                        : 'bg-argos-gray-200 text-argos-gray',
                  )}
                >
                  {isDone ? '✓' : i + 1}
                </div>
                <span
                  className={cn(
                    'text-sm font-bold hidden sm:block',
                    isActive ? 'text-argos-charcoal' : 'text-argos-gray',
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-3',
                    i < stepIdx ? 'bg-argos-green' : 'bg-argos-gray-200',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Step content */}
        <div className="bg-white border border-argos-border rounded p-6">
          {step === 'delivery' && (
            <div>
              <h2 className="text-lg font-bold text-argos-charcoal mb-5">Delivery address</h2>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-argos-charcoal block mb-1">
                      First name
                    </label>
                    <input
                      value={address.firstName}
                      onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                      className="w-full border border-argos-gray-light rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-argos-blue"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-argos-charcoal block mb-1">
                      Last name
                    </label>
                    <input
                      value={address.lastName}
                      onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                      className="w-full border border-argos-gray-light rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-argos-blue"
                    />
                  </div>
                </div>
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
                <div>
                  <label className="text-sm font-bold text-argos-charcoal block mb-1">
                    Address line 2 (optional)
                  </label>
                  <input
                    value={address.line2}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                    className="w-full border border-argos-gray-light rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-argos-blue"
                    placeholder="Flat, suite, floor, building"
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
                      Pincode <span className="text-argos-red">*</span>
                    </label>
                    <input
                      value={address.postcode}
                      onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
                      className="w-full border border-argos-gray-light rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-argos-blue"
                      placeholder="e.g. 400001"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-argos-charcoal block mb-1">
                      Phone
                    </label>
                    <input
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full border border-argos-gray-light rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-argos-blue"
                      placeholder="Mobile number"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-argos-charcoal block mb-1">
                      Email
                    </label>
                    <input
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      className="w-full border border-argos-gray-light rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-argos-blue"
                      placeholder="you@example.com"
                      type="email"
                    />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-argos-charcoal mt-2">Delivery method</h3>
                <div className="flex flex-col gap-2">
                  {DELIVERY_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={cn(
                        'flex items-center justify-between border rounded px-3 py-3 cursor-pointer',
                        deliveryMethod === opt.id
                          ? 'border-argos-blue bg-argos-blue-light'
                          : 'border-argos-gray-light hover:border-argos-gray',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery"
                          value={opt.id}
                          checked={deliveryMethod === opt.id}
                          onChange={() => setDeliveryMethod(opt.id)}
                          className="accent-argos-red"
                        />
                        <div>
                          <p className="text-sm font-bold text-argos-charcoal">{opt.label}</p>
                          <p className="text-xs text-argos-gray">{opt.eta}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-argos-charcoal">
                        {opt.cost === 0 ? 'Free' : formatPriceFromPounds(opt.cost / 100)}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => setStep('payment')}
                  disabled={!canContinueDelivery}
                  className="bg-argos-blue text-white font-bold py-3 px-8 rounded hover:bg-argos-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 w-fit mt-2"
                >
                  Continue to payment
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div>
              <h2 className="text-lg font-bold text-argos-charcoal mb-5">Payment</h2>
              <div className="flex flex-col gap-4 max-w-md">
                {paymentError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded flex items-center gap-2">
                    <AlertCircle size={16} />
                    {paymentError}
                  </div>
                )}

                <div className="bg-argos-gray-bg border border-argos-border rounded p-4 text-sm text-argos-charcoal">
                  <p className="font-bold mb-1">Pay securely with Razorpay</p>
                  <p className="text-argos-gray">
                    Click the button below to open the Razorpay payment window. You can pay using
                    UPI, cards, net banking or wallets.
                  </p>
                  <p className="text-xs text-argos-gray mt-2">
                    Test card: <code>4111 1111 1111 1111</code>, any future expiry, any CVV.
                  </p>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setStep('delivery')}
                    disabled={isProcessing}
                    className="border border-argos-gray-light text-argos-charcoal font-bold py-3 px-6 rounded hover:bg-argos-gray-bg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="bg-argos-blue text-white font-bold py-3 px-8 rounded hover:bg-argos-blue-dark transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing
                      ? 'Processing…'
                      : `Pay ${formatPriceFromPounds(total / 100)} with Razorpay`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="text-center py-8">
              <CheckCircle size={60} className="text-argos-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-argos-charcoal mb-2">Order placed!</h2>
              <p className="text-argos-gray mb-4">Thank you for your order.</p>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        {step !== 'confirmation' && (
          <div className="bg-white border border-argos-border rounded p-4 h-fit">
            <h3 className="text-sm font-bold text-argos-charcoal mb-4 pb-3 border-b border-argos-border">
              Order summary ({items.reduce((a, i) => a + i.quantity, 0)} items)
            </h3>
            <div className="flex flex-col gap-3 mb-4 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-start">
                  <div className="w-12 h-12 bg-argos-gray-bg rounded overflow-hidden flex-shrink-0">
                    <img
                      src={resolveImageUrl(item.product.images?.[0] ?? '')}
                      alt={item.product.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-argos-charcoal line-clamp-2">{item.product.name}</p>
                    <p className="text-xs text-argos-gray-mid">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-argos-charcoal flex-shrink-0">
                    {formatPriceFromPounds((item.unitPrice * item.quantity) / 100)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-argos-border pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-argos-gray">Subtotal</span>
                <span className="text-argos-charcoal">{formatPriceFromPounds(subtotal / 100)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-argos-gray">Delivery</span>
                <span className="text-argos-charcoal">
                  {deliveryCost === 0 ? 'Free' : formatPriceFromPounds(deliveryCost / 100)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-argos-border">
                <span>Total</span>
                <span className="text-argos-red">{formatPriceFromPounds(total / 100)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
