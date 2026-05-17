import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useGetWishlistQuery, useRemoveWishlistItemMutation } from '@/services/wishlistApi'
import { useAddBasketItemMutation } from '@/services/basketApi'
import { resolveImageUrl } from '@/utils/imageUrl'
import { formatPriceFromPounds } from '@/utils/format'

export default function WishlistPage() {
  const { data: items = [], isLoading } = useGetWishlistQuery()
  const [removeItem] = useRemoveWishlistItemMutation()
  const [addToBasket] = useAddBasketItemMutation()

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
        <Heart size={64} className="text-argos-gray-light mx-auto mb-5" />
        <h1 className="text-2xl font-bold text-argos-charcoal mb-2">Your wishlist is empty</h1>
        <p className="text-sm text-argos-gray mb-6">Save items you love for later</p>
        <Link
          to="/"
          className="inline-block bg-argos-green text-white font-bold px-8 py-3 rounded-sm hover:bg-argos-green-dark transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container py-10">
      <h1 className="text-[28px] font-bold text-argos-charcoal mb-8">
        My wishlist ({items.length})
      </h1>

      <div className="bg-white border border-argos-border rounded-sm overflow-hidden">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`flex gap-6 p-6 ${i > 0 ? 'border-t border-argos-border' : ''}`}
          >
            {/* Thumbnail */}
            <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
              <div className="w-32 h-32 bg-argos-gray-bg rounded overflow-hidden">
                <img
                  src={resolveImageUrl(item.product.images[0])}
                  alt={item.product.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                to={`/product/${item.product.slug}`}
                className="text-base font-bold text-argos-charcoal hover:text-argos-blue hover:underline line-clamp-2 leading-snug"
              >
                {item.product.name}
              </Link>
              <p className="text-sm text-argos-gray-mid mt-1.5 mb-3">
                Product code: {item.product.sku}
              </p>
              <p className="text-lg font-bold text-argos-dark mb-3">
                {formatPriceFromPounds(item.product.price / 100)}
              </p>
              {!item.product.inStock && (
                <p className="text-sm text-argos-red mb-3">Out of stock</p>
              )}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => addToBasket({ productId: item.productId, quantity: 1 })}
                  disabled={!item.product.inStock}
                  className="flex items-center gap-2 bg-argos-green text-white text-sm font-bold px-4 py-2.5 rounded-sm hover:bg-argos-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={16} />
                  Add to basket
                </button>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="flex items-center gap-1.5 text-sm text-argos-gray hover:text-argos-red transition-colors"
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
