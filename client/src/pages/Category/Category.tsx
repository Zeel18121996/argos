import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { buildPath } from '@/constants/path'
import { MOCK_CATEGORIES } from '@/data/mock-categories'
import { MOCK_PRODUCTS } from '@/data/mock-products'
import ProductCard from '@/components/Common/ProductCard/ProductCard'
import { ProductCardSkeleton } from '@/components/Common/Skeleton/Skeleton'

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest'

const Category: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>()

  // Component state
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [maxPrice, setMaxPrice] = useState<number>(2000)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const category = MOCK_CATEGORIES.find((c) => c.slug === categorySlug)
  const subCategory = MOCK_CATEGORIES.flatMap((c) => c.children ?? []).find(
    (c) => c.slug === categorySlug,
  )
  const activeCat = category ?? subCategory

  const products = useMemo(() => {
    let list = MOCK_PRODUCTS.filter(
      (p) => p.categorySlug === categorySlug || p.categoryId === activeCat?.id,
    )

    if (list.length === 0) {
      list = MOCK_PRODUCTS.slice(0, 8)
    }

    if (inStockOnly) list = list.filter((p) => p.inStock)
    list = list.filter((p) => p.price <= maxPrice)

    switch (sortBy) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price)
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price)
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating)
      case 'newest':
        return [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
      default:
        return list
    }
  }, [categorySlug, activeCat, sortBy, maxPrice, inStockOnly])

  const FilterPanel = () => (
    <div className="bg-white border border-argos-border rounded p-4">
      <h3 className="font-bold text-sm text-argos-charcoal mb-4 pb-3 border-b border-argos-border">
        Filters
      </h3>

      {/* Price filter */}
      <div className="mb-5 pb-5 border-b border-argos-border">
        <h4 className="text-sm font-bold text-argos-charcoal mb-3">Price</h4>
        <input
          type="range"
          min={0}
          max={2000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-argos-red"
        />
        <div className="flex justify-between text-xs text-argos-gray mt-1">
          <span>₹0</span>
          <span className="font-bold text-argos-charcoal">Up to ₹{maxPrice}</span>
        </div>
      </div>

      {/* Availability */}
      <div className="mb-5">
        <h4 className="text-sm font-bold text-argos-charcoal mb-3">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="accent-argos-red w-4 h-4"
          />
          <span className="text-sm text-argos-charcoal">In stock only</span>
        </label>
      </div>

      {/* Sub-categories */}
      {category?.children && (
        <div>
          <h4 className="text-sm font-bold text-argos-charcoal mb-3">Sub-categories</h4>
          <ul className="flex flex-col gap-1">
            {category.children.map((c) => (
              <li key={c.id}>
                <Link
                  to={buildPath.category(c.slug)}
                  className="text-sm text-argos-blue hover:underline flex items-center gap-1"
                >
                  <ChevronRight size={12} />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  return (
    <div className="argos-container py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-argos-gray mb-5">
        <Link to="/" className="hover:text-argos-red hover:underline">
          Home
        </Link>
        <ChevronRight size={12} />
        <span className="text-argos-charcoal font-bold">{activeCat?.name ?? 'Category'}</span>
      </nav>

      {/* Page title */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-argos-charcoal">
          {activeCat?.name ?? 'All Products'}
        </h1>
        <span className="text-sm text-argos-gray">{products.length} products</span>
      </div>

      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <div className="hidden md:block w-56 flex-shrink-0">
          <FilterPanel />
        </div>

        {/* Product grid + sort */}
        <div className="flex-1 min-w-0">
          {/* Sort + mobile filter bar */}
          <div className="flex items-center justify-between mb-4 bg-white border border-argos-border rounded px-4 py-2">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-2 text-sm font-bold text-argos-charcoal"
            >
              <SlidersHorizontal size={16} />
              Filter
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-argos-gray">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border border-argos-gray-light rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-argos-blue text-argos-charcoal"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Top rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Products */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex">
          <div className="bg-white w-72 h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-argos-charcoal">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X size={20} className="text-argos-charcoal" />
              </button>
            </div>
            <FilterPanel />
          </div>
          <div className="flex-1" onClick={() => setIsMobileFilterOpen(false)} />
        </div>
      )}
    </div>
  )
}

export default Category
