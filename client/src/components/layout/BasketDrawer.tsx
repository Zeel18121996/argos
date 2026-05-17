import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useCart } from '@/hooks/useCart'
import { resolveImageUrl } from '@/utils/imageUrl'
import { formatPriceFromPounds } from '@/utils/format'
import { useGetBasketQuery } from '@/services/basketApi'

interface BasketDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function BasketDrawer({ isOpen, onClose }: BasketDrawerProps) {
  const navigate = useNavigate()
  const { data: basket, isLoading } = useGetBasketQuery(undefined, { skip: !isOpen })
  const { handleUpdateQty, handleRemove } = useCart()

  const handleViewBasket = () => {
    onClose()
    navigate('/basket')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const items = basket?.items ?? []
  const total = basket?.summary.total ?? 0
  const itemCount = basket?.summary.itemCount ?? 0

  // Lock the page beneath the drawer + close on Escape.
  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop — above the sticky header (header z-index is 61). */}
      <div className="fixed inset-0 bg-black/40 z-[100]" aria-hidden="true" onClick={onClose} />

      {/* Drawer panel — sits above the backdrop and the header. */}
      <div
        className="fixed inset-y-0 right-0 w-[90vw] max-w-[420px] bg-white z-[110] flex flex-col shadow-xl animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping basket"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-argos-border shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={22} className="text-argos-charcoal" />
            <span className="text-base font-bold text-argos-charcoal">Your basket ({itemCount})</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-argos-gray-700 hover:text-argos-charcoal focus-ring rounded"
            aria-label="Close basket"
          >
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <ShoppingCart size={52} className="text-argos-gray-light mb-5" />
              <p className="text-base font-bold text-argos-charcoal mb-1.5">Your basket is empty</p>
              <p className="text-sm text-argos-gray mb-5">Add items to get started</p>
              <button onClick={onClose} className="text-sm text-argos-blue hover:underline">
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-argos-border">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-5">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.product.slug}`}
                    onClick={onClose}
                    className="flex-shrink-0"
                  >
                    <div className="w-20 h-20 bg-argos-gray-bg rounded overflow-hidden">
                      <img
                        src={resolveImageUrl(item.product.images[0])}
                        alt={item.product.name}
                        className="w-full h-full object-contain p-1.5"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.slug}`}
                      onClick={onClose}
                      className="text-sm font-bold text-argos-charcoal hover:text-argos-blue hover:underline line-clamp-2 leading-snug"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-argos-gray-mid mt-1 mb-3">{item.product.sku}</p>

                    {/* Qty stepper */}
                    <div className="flex items-center border border-argos-gray-light rounded-sm overflow-hidden w-fit">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) {
                            handleRemove(item.product.id)
                          } else {
                            handleUpdateQty(item.product.id, item.quantity - 1)
                          }
                        }}
                        className="w-8 h-8 flex items-center justify-center text-argos-charcoal hover:bg-argos-gray-bg transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center text-sm font-bold border-x border-argos-gray-light">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-argos-charcoal hover:bg-argos-gray-bg transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Price + Delete — stacked in right column */}
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <div className="text-right">
                      <p className="text-base font-bold text-argos-dark">
                        {formatPriceFromPounds((item.unitPrice * item.quantity) / 100)}
                      </p>
                      <p className="text-xs text-argos-gray-mid mt-0.5">
                        {formatPriceFromPounds(item.unitPrice / 100)} each
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.product.id)}
                      className="text-argos-gray hover:text-argos-red transition-colors p-1 mt-2"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-argos-border p-5 bg-argos-gray-bg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-bold text-argos-charcoal">Total</span>
              <span className="text-xl font-bold text-argos-dark">
                {formatPriceFromPounds(total / 100)}
              </span>
            </div>
            <button
              onClick={handleViewBasket}
              className="block w-full bg-argos-green text-white text-base font-bold py-4 rounded-sm hover:bg-argos-green-dark transition-colors text-center"
            >
              View full basket & checkout
            </button>
            <button
              onClick={onClose}
              className="block w-full text-center text-base text-argos-blue hover:underline mt-3"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
