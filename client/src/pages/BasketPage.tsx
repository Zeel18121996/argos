import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, Tag, ChevronRight, Plus, Minus } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { applyVoucher, removeVoucher } from '@/store/slices/cartSlice'
import { formatPriceFromPounds } from '@/utils/format'
import { resolveImageUrl } from '@/utils/imageUrl'
import { PATHS } from '@/constants/path'
import { cn } from '@/utils/cn'
import { useState } from 'react'

export default function BasketPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items, summary, isLoading, handleRemove, handleUpdateQty, handleClearCart } = useCart()
  const voucherCode = useAppSelector((s) => s.cart.voucherCode)
  const voucherDiscount = useAppSelector((s) => s.cart.voucherDiscount)

  const [voucherInput, setVoucherInput] = useState('')
  const [voucherError, setVoucherError] = useState('')

  const handleApplyVoucher = () => {
    if (voucherInput.toUpperCase() === 'SAVE10') {
      dispatch(applyVoucher({ code: 'SAVE10', discount: 10 }))
      setVoucherError('')
    } else {
      setVoucherError('Invalid voucher code. Try SAVE10')
    }
  }

  if (isLoading) {
    return (
      <div className="page-container py-8">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="page-container py-20 text-center">
        <ShoppingCart size={64} className="text-argos-gray-light mx-auto mb-5" />
        <h1 className="text-2xl font-bold text-argos-charcoal mb-2">Your basket is empty</h1>
        <p className="text-sm text-argos-gray mb-6">Add items to get started</p>
        <Link
          to={PATHS.HOME}
          className="inline-block bg-argos-green text-white font-bold px-8 py-3 rounded-sm hover:bg-argos-green-dark transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container py-6">
      <h1 className="text-2xl font-bold text-argos-charcoal mb-6">
        Your basket ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Items */}
        <div>
          <div className="bg-white border border-argos-border rounded overflow-hidden mb-4">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={cn('flex gap-4 p-4', i > 0 && 'border-t border-argos-border')}
              >
                <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                  <div className="w-24 h-24 bg-argos-gray-bg rounded overflow-hidden">
                    <img
                      src={resolveImageUrl(item.product.images[0])}
                      alt={item.product.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="text-sm font-bold text-argos-charcoal hover:text-argos-blue hover:underline line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-[11px] text-argos-gray-mid mt-0.5 mb-2">
                    Product code: {item.product.sku}
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-argos-gray-light rounded">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) {
                            handleRemove(item.product.id)
                          } else {
                            handleUpdateQty(item.product.id, item.quantity - 1)
                          }
                        }}
                        className="px-2.5 py-1 text-argos-charcoal hover:bg-argos-gray-bg font-bold text-sm"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-2 py-1 text-sm font-bold min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.product.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-argos-charcoal hover:bg-argos-gray-bg font-bold text-sm"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => handleRemove(item.product.id)}
                      className="text-xs text-argos-gray hover:text-argos-red flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-argos-dark text-lg">
                    {formatPriceFromPounds((item.unitPrice * item.quantity) / 100)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-argos-gray-mid">
                      {formatPriceFromPounds(item.unitPrice / 100)} each
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white border border-argos-border rounded p-4 mb-4">
            <h3 className="text-sm font-bold text-argos-charcoal mb-3 flex items-center gap-2">
              <Tag size={16} className="text-argos-red" />
              Voucher code
            </h3>
            {voucherCode ? (
              <div className="flex items-center justify-between bg-argos-green-light border border-argos-green rounded px-3 py-2">
                <span className="text-sm font-bold text-argos-green">{voucherCode} applied</span>
                <button
                  onClick={() => dispatch(removeVoucher())}
                  className="text-xs text-argos-gray hover:text-argos-red"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 border border-argos-gray-light rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-argos-blue"
                />
                <button
                  onClick={handleApplyVoucher}
                  className="bg-argos-charcoal text-white text-sm font-bold px-4 rounded hover:bg-black transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
            {voucherError && <p className="text-xs text-argos-red mt-1">{voucherError}</p>}
          </div>

          <div className="bg-white border border-argos-border rounded p-4 sticky top-32">
            <h3 className="text-base font-bold text-argos-charcoal mb-4 pb-3 border-b border-argos-border">
              Order summary
            </h3>
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-argos-gray">Subtotal</span>
                <span className="font-bold">{formatPriceFromPounds(summary.subtotal / 100)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-argos-gray">Delivery</span>
                <span className="font-bold text-argos-green">Free</span>
              </div>
              {summary.voucherDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-argos-gray">Voucher discount</span>
                  <span className="font-bold text-argos-green">
                    −{formatPriceFromPounds(summary.voucherDiscount / 100)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-between border-t border-argos-border pt-3 mb-5">
              <span className="font-bold text-argos-charcoal">Total</span>
              <span className="text-xl font-bold text-argos-dark">
                {formatPriceFromPounds(summary.total / 100)}
              </span>
            </div>
            <button
              onClick={() => navigate(PATHS.CHECKOUT)}
              className="w-full bg-argos-green text-white font-bold py-3 rounded-sm hover:bg-argos-green-dark transition-colors flex items-center justify-center gap-2"
            >
              Checkout
              <ChevronRight size={16} />
            </button>
            <Link
              to={PATHS.HOME}
              className="block text-center text-sm text-argos-blue hover:underline mt-3"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
