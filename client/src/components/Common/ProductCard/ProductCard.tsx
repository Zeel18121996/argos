import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatPriceFromPounds } from '@/utils/format'
import { buildPath } from '@/constants/path'
import { useCart } from '@/hooks/useCart'
import { useAppSelector } from '@/hooks/useRedux'
import {
  useGetWishlistQuery,
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
} from '@/services/wishlistApi'
import type { Product } from '@/interfaces/product.interface'
import Rating from '@/components/Common/Rating/Rating'
import Badge from '@/components/Common/Badge/Badge'
import { resolveImageUrl } from '@/utils/imageUrl'

interface Props {
  product: Product
  className?: string
}

const ProductCard: React.FC<Props> = ({ product, className }) => {
  const { handleAddToCart, isInCart } = useCart()
  const { data: wishlistItems = [] } = useGetWishlistQuery()
  const [addWishlist] = useAddWishlistItemMutation()
  const [removeWishlist] = useRemoveWishlistItemMutation()
  const isWishlisted = wishlistItems.some((w) => w.productId === product.id)
  const inCart = isInCart(product.id)

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isWishlisted) {
      await removeWishlist(product.id).unwrap()
    } else {
      await addWishlist(product.id).unwrap()
    }
  }

  const handleAddToBasket = (e: React.MouseEvent) => {
    e.preventDefault()
    if (product.inStock) handleAddToCart(product)
  }

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null

  return (
    <Link
      to={buildPath.product(product.slug)}
      className={cn(
        'group bg-white border border-argos-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col relative rounded-sm',
        className,
      )}
    >
      {/* Wishlist button */}
      <button
        onClick={handleWishlist}
        className={cn(
          'absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white shadow-sm transition-colors',
          isWishlisted ? 'text-argos-green' : 'text-argos-gray-mid hover:text-argos-green',
        )}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>

      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.isOnOffer && discount && <Badge label={`Save ${discount}%`} variant="sale" />}
        {product.isNew && <Badge label="New" variant="new" />}
        {product.isClearance && <Badge label="Clearance" variant="clearance" />}
        {!product.inStock && <Badge label="Out of stock" variant="outOfStock" />}
      </div>

      {/* Image */}
      <div className="relative overflow-hidden bg-argos-gray-bg aspect-square">
        <img
          src={resolveImageUrl(product.images[0])}
          alt={product.name}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3">
        {/* Name — 16px / 700 / 24px (matches live Argos product title) */}
        <h3 className="text-[16px] leading-[24px] text-argos-dark font-bold line-clamp-2 mb-1.5 flex-1">
          {product.name}
        </h3>

        {/* Rating */}
        <Rating rating={product.ratingAverage} reviewCount={product.reviewCount} className="mb-2" />

        {/* Price — 16px / 700 / 24px (matches live Argos) */}
        <div className="mb-1.5">
          {product.isOnOffer && product.compareAtPrice && (
            <div className="text-[14px] font-medium text-argos-gray-mid capitalize mb-0.5">
              Less than half price
            </div>
          )}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[16px] leading-[24px] font-bold text-argos-dark">
              {formatPriceFromPounds(product.price / 100)}
            </span>
            {product.compareAtPrice && (
              <span className="text-[14px] text-argos-gray-mid">
                Was{' '}
                <span className="line-through">
                  {formatPriceFromPounds(product.compareAtPrice / 100)}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Delivery */}
        {product.inStock && (
          <p className="text-[14px] text-argos-green mb-2 font-normal">Free delivery available</p>
        )}

        {/* CTA — 18px / 600 / 27px (matches live Argos Add to trolley) */}
        <button
          onClick={handleAddToBasket}
          disabled={!product.inStock}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2.5 text-base font-semibold rounded-sm transition-colors mt-auto',
            product.inStock
              ? 'bg-argos-green text-white hover:bg-argos-green-dark'
              : 'bg-argos-gray-200 text-argos-gray-500 cursor-not-allowed',
          )}
        >
          <ShoppingCart size={16} />
          {!product.inStock ? 'Out of stock' : 'Add to trolley'}
        </button>
      </div>
    </Link>
  )
}

export default ProductCard
