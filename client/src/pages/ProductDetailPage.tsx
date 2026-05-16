import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetProductBySlugQuery } from '@/services/productsApi'
import {
  ChevronRight,
  Truck,
  Store,
  RotateCcw,
  ShieldCheck,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react'
import { formatPriceFromPounds } from '@/utils/format'
import Rating from '@/components/Common/Rating/Rating'
import Badge from '@/components/Common/Badge/Badge'
import { cn } from '@/utils/cn'
import { useCart } from '@/hooks/useCart'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { resolveImageUrl } from '@/utils/imageUrl'
import {
  useGetWishlistQuery,
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
} from '@/services/wishlistApi'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'reviews'>('overview')

  const { data: product, isLoading, error } = useGetProductBySlugQuery(slug ?? '', { skip: !slug })
  const { handleAddToCart, isInCart } = useCart()
  const { data: wishlistItems = [] } = useGetWishlistQuery()
  const [addWishlist] = useAddWishlistItemMutation()
  const [removeWishlist] = useRemoveWishlistItemMutation()

  if (isLoading) {
    return (
      <div className="page-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.2fr_300px] gap-6">
          <div className="bg-gray-200 aspect-square rounded animate-pulse" />
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="page-container py-20 text-center">
        <h2 className="text-xl font-bold text-argos-charcoal mb-2">Product not found</h2>
        <Link to="/" className="text-argos-blue hover:underline">
          Return to home
        </Link>
      </div>
    )
  }

  const isWishlisted = wishlistItems.some((w) => w.productId === product.id)
  const inCart = isInCart(product.id)
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null

  const images = product.images.length
    ? product.images.map(resolveImageUrl)
    : ['https://via.placeholder.com/600']

  return (
    <div className="bg-argos-gray-bg pb-10">
      <div className="page-container py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-argos-gray mb-5">
          <Link to="/" className="hover:text-argos-blue hover:underline">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link
            to={`/browse/${product.categorySlug}`}
            className="hover:text-argos-blue hover:underline capitalize"
          >
            {product.categoryName}
          </Link>
          <ChevronRight size={12} />
          <span className="text-argos-dark line-clamp-1">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.2fr_300px] gap-6 bg-white rounded border border-argos-border p-6">
          {/* Images */}
          <div>
            <div className="aspect-square bg-argos-gray-bg rounded overflow-hidden mb-3">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'w-16 h-16 rounded border-2 overflow-hidden bg-argos-gray-bg flex-shrink-0',
                      i === selectedImage
                        ? 'border-argos-green'
                        : 'border-argos-border hover:border-argos-gray',
                    )}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.isOnOffer && discount && <Badge label={`${discount}% off`} variant="sale" />}
              {product.isNew && <Badge label="New" variant="new" />}
              {!product.inStock && <Badge label="Out of stock" variant="outOfStock" />}
            </div>

            {product.brand && (
              <p className="text-xs font-bold text-argos-blue uppercase tracking-wide mb-1">
                {product.brand}
              </p>
            )}

            <h1 className="text-xl font-bold text-argos-dark mb-2 leading-snug">{product.name}</h1>
            <p className="text-xs text-argos-gray-mid mb-3">Product code: {product.sku}</p>

            <Rating
              rating={product.ratingAverage}
              reviewCount={product.reviewCount}
              size="md"
              className="mb-4"
            />

            <div className="mb-4">
              <span className="text-3xl font-bold text-argos-dark">
                {formatPriceFromPounds(product.price / 100)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-argos-gray-mid line-through ml-3">
                  was {formatPriceFromPounds(product.compareAtPrice / 100)}
                </span>
              )}
            </div>

            <p className="text-sm text-argos-gray leading-relaxed mb-5">
              {product.description ?? ''}
            </p>

            {product.features.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-bold text-argos-dark mb-2">Key features</h3>
                <ul className="flex flex-col gap-1">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-argos-dark">
                      <span className="text-argos-green font-bold mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  if (isWishlisted) await removeWishlist(product.id)
                  else await addWishlist(product.id)
                }}
                className={cn(
                  'flex items-center gap-1.5 text-sm border rounded px-3 py-2 transition-colors',
                  isWishlisted
                    ? 'border-argos-green text-argos-green'
                    : 'border-argos-gray-light text-argos-gray hover:border-argos-green hover:text-argos-green',
                )}
              >
                <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                {isWishlisted ? 'Saved' : 'Save'}
              </button>
              <button className="flex items-center gap-1.5 text-sm text-argos-gray hover:text-argos-dark transition-colors">
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>

          {/* Buy panel */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="bg-argos-gray-bg rounded border border-argos-border p-4">
              <div className="mb-4">
                {product.inStock ? (
                  <p className="text-sm font-bold text-argos-green flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-argos-green inline-block" />
                    In stock
                  </p>
                ) : (
                  <p className="text-sm font-bold text-argos-gray-mid">Out of stock</p>
                )}
              </div>

              {product.inStock && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-argos-dark">Qty:</span>
                  <div className="flex items-center border border-argos-gray-light rounded">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-argos-dark hover:bg-white font-bold"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-bold min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-1.5 text-argos-dark hover:bg-white font-bold"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleAddToCart(product, quantity)}
                disabled={!product.inStock}
                className={cn(
                  'w-full py-3 text-sm font-bold rounded flex items-center justify-center gap-2 mb-3 transition-colors',
                  product.inStock
                    ? inCart
                      ? 'bg-argos-green text-white hover:bg-green-700'
                      : 'bg-argos-green text-white hover:bg-green-700'
                    : 'bg-argos-gray-light text-argos-gray cursor-not-allowed',
                )}
              >
                <ShoppingCart size={16} />
                {!product.inStock ? 'Out of stock' : inCart ? '✓ Added to basket' : 'Add to basket'}
              </button>

              {product.reserveAvailable && (
                <button className="w-full py-3 text-sm font-bold rounded border-2 border-argos-dark text-argos-dark hover:bg-argos-dark hover:text-white transition-colors flex items-center justify-center gap-2">
                  <Store size={16} />
                  Reserve &amp; collect
                </button>
              )}

              {product.deliveryOptions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-argos-border">
                  {product.deliveryOptions.map((opt) => (
                    <div key={opt.type} className="flex items-start gap-2 mb-2">
                      <Truck size={14} className="text-argos-green mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-argos-dark">
                          {opt.price === 0 ? 'Free' : formatPriceFromPounds(opt.price / 100)} —{' '}
                          {opt.label}
                        </p>
                        {opt.availableFrom && (
                          <p className="text-xs text-argos-gray">
                            Available from {opt.availableFrom}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-argos-border flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-argos-gray">
                  <RotateCcw size={12} className="text-argos-blue" />
                  30-day free returns
                </div>
                <div className="flex items-center gap-2 text-xs text-argos-gray">
                  <ShieldCheck size={12} className="text-argos-blue" />
                  Secure checkout
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded border border-argos-border mt-4 overflow-hidden">
          <div className="flex border-b border-argos-border">
            {(['overview', 'specifications', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-6 py-3 text-sm font-bold capitalize transition-colors border-b-2',
                  activeTab === tab
                    ? 'border-argos-green text-argos-green'
                    : 'border-transparent text-argos-dark hover:text-argos-green',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <p className="text-sm text-argos-gray leading-relaxed mb-4">
                  {product.description ?? ''}
                </p>
                {product.features.length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-argos-dark">
                        <span className="text-argos-green font-bold">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {activeTab === 'specifications' && (
              <table className="w-full max-w-lg text-sm">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-argos-gray-bg' : 'bg-white'}>
                      <td className="px-3 py-2 font-bold text-argos-dark w-1/2">{spec.name}</td>
                      <td className="px-3 py-2 text-argos-gray">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-argos-dark">{product.ratingAverage}</p>
                    <Rating
                      rating={product.ratingAverage}
                      showCount={false}
                      size="md"
                      className="justify-center my-1"
                    />
                    <p className="text-xs text-argos-gray">{product.reviewCount} reviews</p>
                  </div>
                </div>
                <p className="text-sm text-argos-gray italic">
                  Reviews will appear here once connected to the reviews backend.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
