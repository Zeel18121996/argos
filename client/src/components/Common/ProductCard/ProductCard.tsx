import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatPaise } from '@/utils/format'
import { buildPath } from '@/constants/path'
import { useCart } from '@/hooks/useCart'
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

// Mirrors Argos ds-c-product-card exactly:
//   card: no border, no radius, no shadow — white bg, full-height flex column
//   image: 1:1 aspect, object-contain, no internal padding, mb-4
//   body: 8px (mt-2) between each section
//   title: 16px / weight 400 (regular) / 2-line clamp
//   rating: mt-2
//   price: 16px bold
//   "Add to trolley": h-12 (48px), border-radius 8px, 18px/600, green
const ProductCard: React.FC<Props> = ({ product, className }) => {
  const { handleAddToCart, isInCart } = useCart()
  const { data: wishlistItems = [] } = useGetWishlistQuery()
  const [addWishlist] = useAddWishlistItemMutation()
  const [removeWishlist] = useRemoveWishlistItemMutation()
  const isWishlisted = wishlistItems.some((w) => w.productId === product.id)

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isWishlisted) await removeWishlist(product.id).unwrap()
    else await addWishlist(product.id).unwrap()
  }

  const handleAddToBasket = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.inStock) handleAddToCart(product)
  }

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null

  return (
    <Link
      to={buildPath.product(product.slug)}
      className={cn(
        'group bg-white flex flex-col h-full',
        'border border-argos-gray-200 hover:shadow-sm transition-all duration-150',
        className,
      )}
    >
      {/* ── Image area ───────────────────────────────────────── */}
      <div className="relative aspect-square w-full bg-[#F5F5F5] overflow-hidden">
        <img
          src={resolveImageUrl(product.images[0])}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />

        {/* Wishlist button — overlaid top-right */}
        <button
          onClick={handleWishlist}
          type="button"
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className={cn(
            'absolute top-2 right-2 z-10 p-1 rounded-full bg-white/90 hover:bg-white transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-argos-blue',
            isWishlisted ? 'text-argos-red' : 'text-argos-gray-400 hover:text-argos-red',
          )}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={1.5} aria-hidden="true" />
        </button>

        {/* Badges — overlaid top-left */}
        {(product.isOnOffer || product.isNew || product.isClearance || !product.inStock) && (
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {product.isOnOffer && discount && <Badge label={`Save ${discount}%`} variant="sale" />}
            {product.isNew && <Badge label="New" variant="new" />}
            {product.isClearance && <Badge label="Clearance" variant="clearance" />}
            {!product.inStock && <Badge label="Out of stock" variant="outOfStock" />}
          </div>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 px-3 pt-3 pb-4">
        {/* Title — always 2 lines tall (min-h = 2 × 24px line-height)
            so that 1-line titles reserve the same space as 2-line ones,
            keeping rating / price / button aligned across all cards. */}
        <h3
          className="text-[16px] leading-[24px] font-normal text-[#262626] line-clamp-2 min-h-[48px] mb-2"
          style={{ fontFamily: 'Barlow, "Helvetica Neue", Helvetica, Arial, sans-serif' }}
        >
          {product.name}
        </h3>

        {/* Rating — fixed single-line height */}
        <div className="h-6 mt-2 flex items-center">
          <Rating rating={product.ratingAverage} reviewCount={product.reviewCount} />
        </div>

        {/* Price — fixed height (1 or 2 lines with was-price) */}
        <div className="mt-2 min-h-[48px] flex flex-col justify-end">
          {product.isOnOffer && product.compareAtPrice ? (
            <p className="text-[13px] text-argos-gray-mid mb-0.5">
              Was <span className="line-through">{formatPaise(product.compareAtPrice)}</span>
            </p>
          ) : (
            <div className="h-[18px]" />
          )}
          <p className="text-[18px] leading-[24px] font-bold text-[#262626]">
            {formatPaise(product.price)}
          </p>
        </div>

        {/* ── Footer: Add to trolley — h-12 (48px), radius 8px, 18px/600 */}
        <button
          onClick={handleAddToBasket}
          disabled={!product.inStock}
          type="button"
          className={cn(
            'w-full h-12 flex items-center justify-center gap-2 mt-4 rounded-lg',
            'text-[18px] font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-argos-blue',
            product.inStock
              ? 'bg-argos-green text-white hover:bg-argos-green-dark cursor-pointer'
              : 'bg-argos-gray-200 text-argos-gray-500 cursor-not-allowed',
          )}
        >
          <ShoppingCart size={18} aria-hidden="true" />
          {product.inStock ? 'Add to trolley' : 'Out of stock'}
        </button>
      </div>
    </Link>
  )
}

export default ProductCard
