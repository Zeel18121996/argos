import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/formatPrice'

export interface ProductCardData {
  id: string
  name: string
  imageUrl?: string
  pricePence: number
  wasPricePence?: number
  rating?: number
  reviewCount?: number
  badge?: string
  slug?: string
}

interface ProductCarouselProps {
  title: string
  viewAllHref?: string
  products?: ProductCardData[]
  isLoading?: boolean
  skeletonCount?: number
}

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: ProductCardData }) {
  const discount = product.wasPricePence
    ? Math.round(((product.wasPricePence - product.pricePence) / product.wasPricePence) * 100)
    : 0

  return (
    <div className="shrink-0 w-[160px] sm:w-[180px] md:w-[200px] bg-white rounded border border-argos-gray-200 p-3 flex flex-col hover:shadow-card-hover transition-shadow group">
      {/* Badge */}
      {product.badge && (
        <span className="self-start mb-1.5 bg-argos-yellow text-argos-yellow-text text-2xs font-bold px-1.5 py-0.5 rounded">
          {product.badge}
        </span>
      )}

      {/* Image */}
      <Link
        to={`/product/${product.id}`}
        className="block aspect-square mb-2 overflow-hidden rounded bg-argos-gray-50"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-argos-gray-300">
            <ShoppingCart size={32} strokeWidth={1} />
          </div>
        )}
      </Link>

      {/* Name */}
      <Link
        to={`/product/${product.id}`}
        className="text-sm text-argos-gray-700 line-clamp-2 leading-snug hover:text-argos-blue transition-colors mb-1 flex-1"
      >
        {product.name}
      </Link>

      {/* Rating */}
      {product.rating !== undefined && (
        <div className="flex items-center gap-1 mb-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                className={cn(
                  i < Math.round(product.rating!)
                    ? 'text-argos-yellow fill-argos-yellow'
                    : 'text-argos-gray-300',
                )}
              />
            ))}
          </div>
          {product.reviewCount !== undefined && (
            <span className="text-2xs text-argos-gray-500">({product.reviewCount})</span>
          )}
        </div>
      )}

      {/* Price */}
      <div className="mb-2">
        <span className="text-md font-bold text-argos-gray-800">
          {formatPrice(product.pricePence)}
        </span>
        {product.wasPricePence && (
          <span className="ml-1.5 text-xs text-argos-gray-500 line-through">
            was {formatPrice(product.wasPricePence)}
          </span>
        )}
        {discount > 0 && (
          <span className="ml-1.5 text-2xs font-bold text-argos-orange">-{discount}%</span>
        )}
      </div>

      {/* Add to trolley */}
      <button
        className="w-full h-9 bg-argos-red hover:bg-argos-red-dark text-white text-xs font-semibold rounded transition-colors"
        aria-label={`Add ${product.name} to trolley`}
      >
        Add to trolley
      </button>
    </div>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="shrink-0 w-[160px] sm:w-[180px] md:w-[200px] bg-white rounded border border-argos-gray-200 p-3 space-y-2">
      <div className="aspect-square skeleton rounded" />
      <div className="h-3 skeleton w-full rounded" />
      <div className="h-3 skeleton w-3/4 rounded" />
      <div className="h-4 skeleton w-1/2 rounded" />
      <div className="h-9 skeleton rounded" />
    </div>
  )
}

// ── Carousel ──────────────────────────────────────────────────────────────────
export function ProductCarousel({
  title,
  viewAllHref,
  products,
  isLoading = false,
  skeletonCount = 6,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 420 : -420, behavior: 'smooth' })
  }

  return (
    <section aria-label={title}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-argos-gray-800">{title}</h2>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="text-sm text-argos-blue hover:text-argos-blue-dark hover:underline transition-colors"
          >
            View all
          </Link>
        )}
      </div>

      {/* Scrollable row with arrows */}
      <div className="relative group/carousel">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 bg-white border border-argos-gray-200 shadow-md rounded-full items-center justify-center text-argos-gray-600 hover:text-argos-gray-900 hover:shadow-lg transition-all opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {isLoading
            ? Array.from({ length: skeletonCount }).map((_, i) => <SkeletonCard key={i} />)
            : (products ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 bg-white border border-argos-gray-200 shadow-md rounded-full items-center justify-center text-argos-gray-600 hover:text-argos-gray-900 hover:shadow-lg transition-all opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  )
}
