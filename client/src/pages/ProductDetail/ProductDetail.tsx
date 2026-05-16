import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, Truck, Store, RotateCcw, ShieldCheck, Heart, Share2 } from 'lucide-react'
import { getProductBySlug, getFeaturedProducts } from '@/data/mock-products'
import { formatPriceFromPounds } from '@/utils/format'
import { buildPath } from '@/constants/path'
import { useCart } from '@/hooks/useCart'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { toggleWishlist } from '@/store/slices/wishlistSlice'
import Rating from '@/components/Common/Rating/Rating'
import Badge from '@/components/Common/Badge/Badge'
import ProductCard from '@/components/Common/ProductCard/ProductCard'
import { cn } from '@/utils/cn'

type Tab = 'overview' | 'specifications' | 'reviews'

const ProductDetail: React.FC = () => {
  const { productSlug } = useParams<{ productSlug: string }>()

  // Component state
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [quantity, setQuantity] = useState(1)

  // Custom hooks
  const { handleAddToCart, isInCart } = useCart()

  // Redux state & dispatch
  const dispatch = useAppDispatch()
  const wishlistItems = useAppSelector((s) => s.wishlist.items)

  const product = getProductBySlug(productSlug ?? '')
  const related = getFeaturedProducts()
    .filter((p) => p.id !== product?.id)
    .slice(0, 5)

  if (!product) {
    return (
      <div className="argos-container py-20 text-center">
        <h2 className="text-xl font-bold text-argos-charcoal mb-2">Product not found</h2>
        <Link to="/" className="text-argos-blue hover:underline">
          Return to home
        </Link>
      </div>
    )
  }

  const isWishlisted = wishlistItems.some((p) => p.id === product.id)
  const inCart = isInCart(product.id)
  const discount = product.wasPrice
    ? Math.round(((product.wasPrice - product.price) / product.wasPrice) * 100)
    : null

  return (
    <div className="bg-argos-gray-bg pb-10">
      <div className="argos-container py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-argos-gray mb-5">
          <Link to="/" className="hover:text-argos-red hover:underline">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link
            to={buildPath.category(product.categorySlug)}
            className="hover:text-argos-red hover:underline"
          >
            {product.categoryName}
          </Link>
          <ChevronRight size={12} />
          <span className="text-argos-charcoal line-clamp-1">{product.name}</span>
        </nav>

        {/* Main product section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.2fr_300px] gap-6 bg-white rounded border border-argos-border p-6">
          {/* Images */}
          <div>
            <div className="aspect-square bg-argos-gray-bg rounded overflow-hidden mb-3">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'w-16 h-16 rounded border-2 overflow-hidden bg-argos-gray-bg flex-shrink-0',
                      i === selectedImage
                        ? 'border-argos-red'
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

          {/* Product info */}
          <div>
            {/* Badges */}
            <div className="flex items-center gap-2 mb-2">
              {product.isSale && discount && <Badge label={`${discount}% off`} variant="sale" />}
              {product.isNew && <Badge label="New" variant="new" />}
              {!product.inStock && <Badge label="Out of stock" variant="outOfStock" />}
            </div>

            {/* Brand */}
            {product.brand && (
              <p className="text-xs font-bold text-argos-blue uppercase tracking-wide mb-1">
                {product.brand}
              </p>
            )}

            {/* Name */}
            <h1 className="text-xl font-bold text-argos-charcoal mb-2 leading-snug">
              {product.name}
            </h1>

            {/* SKU */}
            <p className="text-xs text-argos-gray-mid mb-3">Product code: {product.sku}</p>

            {/* Rating */}
            <Rating
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="md"
              className="mb-4"
            />

            {/* Price */}
            <div className="mb-4">
              <span className="text-3xl font-bold text-argos-red">
                {formatPriceFromPounds(product.price)}
              </span>
              {product.wasPrice && (
                <span className="text-sm text-argos-gray-mid line-through ml-3">
                  was {formatPriceFromPounds(product.wasPrice)}
                </span>
              )}
              {discount && (
                <span className="ml-2 text-sm font-bold text-argos-red">
                  Save {formatPriceFromPounds(product.wasPrice! - product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-argos-gray leading-relaxed mb-5">{product.description}</p>

            {/* Key features */}
            <div className="mb-5">
              <h3 className="text-sm font-bold text-argos-charcoal mb-2">Key features</h3>
              <ul className="flex flex-col gap-1">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-argos-charcoal">
                    <span className="text-argos-green font-bold mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch(toggleWishlist(product))}
                className={cn(
                  'flex items-center gap-1.5 text-sm border rounded px-3 py-2 transition-colors',
                  isWishlisted
                    ? 'border-argos-red text-argos-red'
                    : 'border-argos-gray-light text-argos-gray hover:border-argos-red hover:text-argos-red',
                )}
              >
                <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                {isWishlisted ? 'Saved' : 'Save'}
              </button>
              <button className="flex items-center gap-1.5 text-sm text-argos-gray hover:text-argos-charcoal transition-colors">
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>

          {/* Buy panel */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="bg-argos-gray-bg rounded border border-argos-border p-4">
              {/* Availability */}
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

              {/* Quantity */}
              {product.inStock && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-argos-charcoal">Qty:</span>
                  <div className="flex items-center border border-argos-gray-light rounded">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-argos-charcoal hover:bg-argos-gray-bg font-bold"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm font-bold min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-1.5 text-argos-charcoal hover:bg-argos-gray-bg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to basket */}
              <button
                onClick={() => {
                  for (let i = 0; i < quantity; i++) handleAddToCart(product)
                }}
                disabled={!product.inStock}
                className={cn(
                  'w-full py-3 text-sm font-bold rounded flex items-center justify-center gap-2 mb-3 transition-colors',
                  product.inStock
                    ? inCart
                      ? 'bg-argos-green text-white hover:bg-green-700'
                      : 'bg-argos-blue text-white hover:bg-argos-blue-dark'
                    : 'bg-argos-gray-light text-argos-gray cursor-not-allowed',
                )}
              >
                {!product.inStock ? 'Out of stock' : inCart ? '✓ Added to basket' : 'Add to basket'}
              </button>

              {/* Reserve */}
              {product.reserveAvailable && (
                <button className="w-full py-3 text-sm font-bold rounded border-2 border-argos-charcoal text-argos-charcoal hover:bg-argos-charcoal hover:text-white transition-colors flex items-center justify-center gap-2">
                  <Store size={16} />
                  Reserve &amp; collect
                </button>
              )}

              {/* Delivery options */}
              {product.deliveryOptions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-argos-border">
                  {product.deliveryOptions.map((opt) => (
                    <div key={opt.type} className="flex items-start gap-2 mb-2">
                      <Truck size={14} className="text-argos-green mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-argos-charcoal">
                          {opt.price === 0 ? 'Free' : formatPriceFromPounds(opt.price)} —{' '}
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

              {/* Trust signals */}
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
            {(['overview', 'specifications', 'reviews'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-6 py-3 text-sm font-bold capitalize transition-colors border-b-2',
                  activeTab === tab
                    ? 'border-argos-red text-argos-red'
                    : 'border-transparent text-argos-charcoal hover:text-argos-red',
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
                  {product.description}
                </p>
                <ul className="flex flex-col gap-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-argos-charcoal">
                      <span className="text-argos-green font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'specifications' && (
              <table className="w-full max-w-lg text-sm">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-argos-gray-bg' : 'bg-white'}>
                      <td className="px-3 py-2 font-bold text-argos-charcoal w-1/2">{spec.name}</td>
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
                    <p className="text-5xl font-bold text-argos-charcoal">{product.rating}</p>
                    <Rating
                      rating={product.rating}
                      showCount={false}
                      size="md"
                      className="justify-center my-1"
                    />
                    <p className="text-xs text-argos-gray">{product.reviewCount} reviews</p>
                  </div>
                </div>
                <p className="text-sm text-argos-gray italic">
                  Customer reviews are loaded from our backend API. Connect the NestJS server to see
                  live reviews.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-argos-charcoal mb-4">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
