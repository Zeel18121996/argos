import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetProductsQuery } from '@/services/productsApi'
import ProductCard from '@/components/Common/ProductCard/ProductCard'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'

export default function BrowsePage() {
  const { '*': slugPath } = useParams<{ '*': string }>()
  const categorySlug = slugPath?.split('/')[0] ?? ''
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, error } = useGetProductsQuery({
    categorySlug,
    sortBy: sortBy as any,
    limit: 24,
    page: 1,
  })

  const products = data?.items ?? []
  const meta = data?.meta

  return (
    <div className="page-container py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-argos-gray-500 mb-4">
        <Link to="/" className="hover:text-argos-blue hover:underline">
          Home
        </Link>
        <ChevronRight size={14} />
        <span className="text-argos-dark capitalize">{categorySlug.replace(/-/g, ' ')}</span>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-argos-dark capitalize">
          {categorySlug.replace(/-/g, ' ')}
        </h1>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="flex items-center gap-2 text-sm font-bold text-argos-dark border border-argos-border rounded px-3 py-2 hover:bg-argos-gray-50"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      {/* Filters bar */}
      {showFilters && (
        <div className="bg-white border border-argos-border rounded p-4 mb-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-argos-dark">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-argos-border rounded px-2 py-1 text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      )}

      {/* Results count */}
      {meta && <p className="text-sm text-argos-gray-500 mb-4">{meta.total} results</p>}

      {/* Product grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-gray-200 aspect-[3/4] rounded animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-argos-red mb-2">Failed to load products.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-argos-blue hover:underline text-sm"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-argos-gray-600">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
