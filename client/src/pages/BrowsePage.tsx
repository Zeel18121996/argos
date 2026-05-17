import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetProductsQuery } from '@/services/productsApi'
import { useGetCategoriesQuery } from '@/services/categoriesApi'
import type { Category } from '@/types/category.types'
import ProductCard from '@/components/Common/ProductCard/ProductCard'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'

/** Locate a category (and its ancestor chain) by slug from a nested tree. */
function findCategoryPath(
  tree: Category[],
  slug: string,
  trail: Category[] = [],
): Category[] | null {
  for (const cat of tree) {
    const next = [...trail, cat]
    if (cat.slug === slug) return next
    if (cat.children?.length) {
      const found = findCategoryPath(cat.children, slug, next)
      if (found) return found
    }
  }
  return null
}

export default function BrowsePage() {
  const { '*': slugPath } = useParams<{ '*': string }>()
  const segments = (slugPath ?? '').split('/').filter(Boolean)
  // Always use the deepest segment as the active filter — supports both
  // /browse/<parent> and /browse/<parent>/<child> shaped URLs.
  const rawSlug = segments[segments.length - 1] ?? ''
  // 'trending' is a virtual slug — it isn't a category, it switches the
  // listing to "most ordered" products with no category filter.
  const isTrending = rawSlug === 'trending'
  const categorySlug = isTrending ? '' : rawSlug

  const [sortBy, setSortBy] = useState<string>(isTrending ? 'popular' : 'relevance')
  const [showFilters, setShowFilters] = useState(false)

  const { data: categories = [] } = useGetCategoriesQuery()

  const path = useMemo(
    () => (categorySlug ? findCategoryPath(categories, categorySlug) : null),
    [categories, categorySlug],
  )
  const activeCategory = path?.[path.length - 1]
  const subcategories = activeCategory?.children ?? []
  const displayName = isTrending
    ? 'Trending'
    : activeCategory?.name ?? (categorySlug ? categorySlug.replace(/-/g, ' ') : 'All products')

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
      <nav className="flex flex-wrap items-center gap-1 text-sm text-argos-gray-500 mb-4">
        <Link to="/" className="hover:text-argos-blue hover:underline">
          Home
        </Link>
        {(path ??
          (isTrending
            ? [{ slug: 'trending', name: 'Trending', id: 'trending' } as Category]
            : categorySlug
              ? [{ slug: categorySlug, name: displayName, id: 'fallback' } as Category]
              : [{ slug: '', name: 'All products', id: 'all' } as Category])).map((cat, i, arr) => {
          const isLast = i === arr.length - 1
          return (
            <span key={cat.id} className="flex items-center gap-1">
              <ChevronRight size={14} />
              {isLast ? (
                <span className="text-argos-dark capitalize">{cat.name}</span>
              ) : (
                <Link
                  to={`/browse/${cat.slug}`}
                  className="hover:text-argos-blue hover:underline capitalize"
                >
                  {cat.name}
                </Link>
              )}
            </span>
          )
        })}
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-argos-dark capitalize">{displayName}</h1>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="flex items-center gap-2 text-sm font-bold text-argos-dark border border-argos-border rounded px-3 py-2 hover:bg-argos-gray-50"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      {/* Subcategory chips — visible when active category has children */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {subcategories.map((child) => (
            <Link
              key={child.id}
              to={`/browse/${child.slug}`}
              className="text-sm font-medium border border-argos-border rounded-full px-3 py-1.5 bg-white text-argos-dark hover:bg-argos-gray-50 hover:border-argos-blue hover:text-argos-blue transition-colors"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

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
              <option value="popular">Most ordered</option>
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
