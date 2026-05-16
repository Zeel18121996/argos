import { Link } from 'react-router-dom'
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
  const { data: basket, isLoading } = useGetBasketQuery(undefined, { skip: !isOpen })
  const { handleUpdateQty, handleRemove } = useCart()

  const items = basket?.items ?? []
  const total = basket?.summary.total ?? 0
  const itemCount = basket?.summary.itemCount ?? 0

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" aria-hidden="true" onClick={onClose} />

      {/* Drawer panel */}
      <div
        className="fixed inset-y-0 right-0 w-[90vw] max-w-[420px] bg-white z-60 flex flex-col shadow-xl animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping basket"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-argos-border shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-argos-charcoal" />
            <span className="font-bold text-argos-charcoal">Your basket ({itemCount})</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-argos-gray-700 hover:text-argos-charcoal focus-ring rounded"
            aria-label="Close basket"
          >
            <X size={20} />
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
              <ShoppingCart size={48} className="text-argos-gray-light mb-4" />
              <p className="text-sm font-bold text-argos-charcoal mb-1">Your basket is empty</p>
              <p className="text-xs text-argos-gray mb-4">Add items to get started</p>
              <button onClick={onClose} className="text-sm text-argos-blue hover:underline">
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className={cn('flex gap-3 p-4', i > 0 && 'border-t border-argos-border')}
                >
                  <Link
                    to={`/product/${item.product.slug}`}
                    onClick={onClose}
                    className="flex-shrink-0"
                  >
                    <div className="w-16 h-16 bg-argos-gray-bg rounded overflow-hidden">
                      <img
                        src={resolveImageUrl(item.product.images[0])}
                        alt={item.product.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.slug}`}
                      onClick={onClose}
                      className="text-xs font-bold text-argos-charcoal hover:text-argos-blue hover:underline line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-[11px] text-argos-gray-mid mb-1.5">{item.product.sku}</p>

                    <div className="flex items-center justify-between">
                      {/* Qty stepper */}
                      <div className="flex items-center border border-argos-gray-light rounded">
                        <button
                          onClick={() => {
                            if (item.quantity <= 1) {
                              handleRemove(item.product.id)
                            } else {
                              handleUpdateQty(item.product.id, item.quantity - 1)
                            }
                          }}
                          className="px-2 py-1 text-argos-charcoal hover:bg-argos-gray-bg font-bold"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-bold min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-argos-charcoal hover:bg-argos-gray-bg font-bold"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.product.id)}
                        className="text-argos-gray hover:text-argos-red transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-argos-dark">
                      {formatPriceFromPounds((item.unitPrice * item.quantity) / 100)}
                    </p>
                    <p className="text-[11px] text-argos-gray-mid">
                      {formatPriceFromPounds(item.unitPrice / 100)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-argos-border p-4 bg-argos-gray-bg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-argos-charcoal">Total</span>
              <span className="text-lg font-bold text-argos-dark">
                {formatPriceFromPounds(total / 100)}
              </span>
            </div>
            <Link
              to="/basket"
              onClick={onClose}
              className="block w-full bg-argos-green text-white text-sm font-bold py-3 rounded-sm hover:bg-argos-green-dark transition-colors text-center"
            >
              View full basket & checkout
            </Link>
            <button
              onClick={onClose}
              className="block w-full text-center text-sm text-argos-blue hover:underline mt-2"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
