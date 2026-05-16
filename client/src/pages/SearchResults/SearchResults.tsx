import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { searchProducts } from '@/data/mock-products'
import ProductCard from '@/components/Common/ProductCard/ProductCard'

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const results = useMemo(() => searchProducts(query), [query])

  return (
    <div className="argos-container py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-argos-gray mb-1">
          <Search size={16} />
          <span className="text-sm">Search results for</span>
        </div>
        <h1 className="text-2xl font-bold text-argos-charcoal">"{query}"</h1>
        <p className="text-sm text-argos-gray mt-1">{results.length} results found</p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded border border-argos-border p-12 text-center">
          <Search size={40} className="text-argos-gray-light mx-auto mb-4" />
          <h2 className="text-lg font-bold text-argos-charcoal mb-2">No results for "{query}"</h2>
          <p className="text-sm text-argos-gray">
            Try checking your spelling or using different keywords.
          </p>
        </div>
      )}
    </div>
  )
}

export default SearchResults
