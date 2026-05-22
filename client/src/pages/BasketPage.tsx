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
    <div className="page-container py-8">
      {/* Page heading */}
      <h1 className="text-[28px] font-bold text-argos-charcoal mb-8 leading-tight">
        Your basket ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* ── Item list ── */}
        <div className="space-y-0">
          <div className="bg-white border border-argos-border rounded-sm overflow-hidden">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={cn(
                  'flex gap-6 p-6',
                  i > 0 && 'border-t border-argos-border',
                )}
              >
                {/* Product image */}
                <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                  <div className="w-32 h-32 bg-argos-gray-bg rounded overflow-hidden">
                    <img
                      src={resolveImageUrl(item.product.images[0])}
                      alt={item.product.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                </Link>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="text-base font-bold text-argos-charcoal hover:text-argos-blue hover:underline line-clamp-2 leading-snug"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-argos-gray-mid mt-1.5 mb-4">
                    Product code: {item.product.sku}
                  </p>

                  {/* Quantity stepper */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center border border-argos-gray-light rounded-sm overflow-hidden">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) {
                            handleRemove(item.product.id)
                          } else {
                            handleUpdateQty(item.product.id, item.quantity - 1)
                          }
                        }}
                        className="w-10 h-10 flex items-center justify-center text-argos-charcoal hover:bg-argos-gray-bg transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 h-10 flex items-center justify-center text-base font-bold border-x border-argos-gray-light">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.product.id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-argos-charcoal hover:bg-argos-gray-bg transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.product.id)}
                    className="text-sm text-argos-gray hover:text-argos-red flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-argos-dark">
                    {formatPriceFromPounds((item.unitPrice * item.quantity) / 100)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-sm text-argos-gray-mid mt-1">
                      {formatPriceFromPounds(item.unitPrice / 100)} each
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Order summary ── */}
        <div>
          <div className="bg-white border border-argos-border rounded-sm p-6 sticky top-32">
            <h3 className="text-lg font-bold text-argos-charcoal mb-5 pb-4 border-b border-argos-border">
              Order summary
            </h3>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-base text-argos-gray">Subtotal</span>
                <span className="text-base font-bold text-argos-charcoal">
                  {formatPriceFromPounds(summary.subtotal / 100)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-argos-border pt-4 mb-6">
              <span className="text-lg font-bold text-argos-charcoal">Total</span>
              <span className="text-2xl font-bold text-argos-dark">
                {formatPriceFromPounds(summary.total / 100)}
              </span>
            </div>

            <button
              onClick={() => navigate(PATHS.CHECKOUT)}
              className="w-full bg-argos-green text-white text-base font-bold py-4 rounded-sm hover:bg-argos-green-dark transition-colors flex items-center justify-center gap-2"
            >
              Checkout
              <ChevronRight size={18} />
            </button>

            <Link
              to={PATHS.HOME}
              className="block text-center text-base text-argos-blue hover:underline mt-4"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
