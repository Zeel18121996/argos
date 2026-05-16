import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useGetAdminProductsQuery,
  useDeleteAdminProductMutation,
} from '@/services/adminProductsApi'
import { useGetCategoriesQuery } from '@/services/categoriesApi'
import { formatPriceFromPounds } from '@/utils/format'
import { Search, Plus, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react'
import { resolveImageUrl } from '@/utils/imageUrl'

export default function AdminProductsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [brand, setBrand] = useState('')
  const [sortBy, setSortBy] = useState('relevance')

  const { data, isLoading, error } = useGetAdminProductsQuery({
    page,
    limit: 30,
    q: q || undefined,
    brand: brand || undefined,
    sortBy,
  })

  const [deleteProduct] = useDeleteAdminProductMutation()

  const { data: categories = [] } = useGetCategoriesQuery()

  const products = data?.items ?? []
  const meta = data?.meta

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-argos-dark">Products</h1>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-2 bg-argos-green text-white font-bold px-4 py-2 rounded hover:bg-argos-green-dark transition-colors"
        >
          <Plus size={16} />
          Add product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-argos-border rounded p-4 mb-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={16} className="text-argos-gray" />
          <input
            type="text"
            placeholder="Search products..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            className="flex-1 border border-argos-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-argos-green"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-argos-dark">Brand</label>
          <input
            type="text"
            placeholder="Filter by brand"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value)
              setPage(1)
            }}
            className="border border-argos-border rounded px-3 py-2 text-sm w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-argos-dark">Sort</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-argos-border rounded px-2 py-2 text-sm"
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
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
      ) : (
        <>
          <div className="bg-white border border-argos-border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-argos-gray-bg border-b border-argos-border">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-argos-dark">Name</th>
                  <th className="text-left px-4 py-3 font-bold text-argos-dark">SKU</th>
                  <th className="text-left px-4 py-3 font-bold text-argos-dark">Brand</th>
                  <th className="text-left px-4 py-3 font-bold text-argos-dark">Category</th>
                  <th className="text-right px-4 py-3 font-bold text-argos-dark">Price</th>
                  <th className="text-center px-4 py-3 font-bold text-argos-dark">Stock</th>
                  <th className="text-center px-4 py-3 font-bold text-argos-dark">Status</th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-argos-border hover:bg-argos-gray-bg transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded border border-argos-border bg-white overflow-hidden flex-shrink-0">
                          <img
                            src={resolveImageUrl(p.images[0])}
                            alt={p.name}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-argos-dark line-clamp-1">{p.name}</p>
                          <p className="text-xs text-argos-gray">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-argos-gray">{p.sku}</td>
                    <td className="px-4 py-3 text-argos-gray">{p.brand ?? '—'}</td>
                    <td className="px-4 py-3 text-argos-gray">{p.categoryName}</td>
                    <td className="px-4 py-3 text-right font-bold text-argos-dark">
                      {formatPriceFromPounds(p.price / 100)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${p.stockCount > 20 ? 'bg-green-100 text-green-700' : p.stockCount > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {p.stockCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative group">
                        <button className="p-1 rounded hover:bg-argos-gray-bg">
                          <MoreHorizontal size={16} className="text-argos-gray" />
                        </button>
                        <div className="absolute right-0 top-full z-20 hidden group-hover:block bg-white border border-argos-border rounded shadow-lg min-w-[140px]">
                          <button
                            onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-argos-gray-bg"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deactivate "${p.name}"?`)) deleteProduct(p.id)
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Deactivate
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-argos-gray">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-argos-gray">
                Showing {(meta.page - 1) * meta.limit + 1}–
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-argos-border rounded text-sm disabled:opacity-50 hover:bg-argos-gray-bg"
                >
                  Previous
                </button>
                <span className="text-sm font-bold text-argos-dark">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  className="px-3 py-1.5 border border-argos-border rounded text-sm disabled:opacity-50 hover:bg-argos-gray-bg"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
