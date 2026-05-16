import { useState } from 'react'
import { useGetAdminOrdersQuery, useUpdateAdminOrderStatusMutation } from '@/services/ordersApi'
import { formatPriceFromPounds } from '@/utils/format'
import { Search, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading, error } = useGetAdminOrdersQuery({
    page,
    limit: 30,
    status: statusFilter || undefined,
    q: q || undefined,
  })

  const [updateStatus, { isLoading: isUpdating }] = useUpdateAdminOrderStatusMutation()

  const orders = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-argos-dark">Orders</h1>

      {/* Filters */}
      <div className="bg-white border border-argos-border rounded p-4 mb-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={16} className="text-argos-gray" />
          <input
            type="text"
            placeholder="Search by order number..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            className="flex-1 border border-argos-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-argos-green"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-argos-dark">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="border border-argos-border rounded px-2 py-2 text-sm"
          >
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
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
          <p className="text-argos-red mb-2">Failed to load orders.</p>
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
                  <th className="text-left px-4 py-3 font-bold text-argos-dark">Order number</th>
                  <th className="text-left px-4 py-3 font-bold text-argos-dark">Status</th>
                  <th className="text-left px-4 py-3 font-bold text-argos-dark">Items</th>
                  <th className="text-right px-4 py-3 font-bold text-argos-dark">Total</th>
                  <th className="text-left px-4 py-3 font-bold text-argos-dark">Date</th>
                  <th className="px-4 py-3 font-bold text-argos-dark">Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-argos-border hover:bg-argos-gray-bg transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-argos-dark">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-block text-xs font-bold px-2 py-0.5 rounded uppercase',
                          order.status === 'cancelled' || order.status === 'refunded'
                            ? 'bg-red-100 text-red-700'
                            : order.status === 'delivered'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'shipped'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700',
                        )}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-argos-gray">{order.itemCount}</td>
                    <td className="px-4 py-3 text-right font-bold text-argos-dark">
                      {formatPriceFromPounds(order.total / 100)}
                    </td>
                    <td className="px-4 py-3 text-argos-gray text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        disabled={isUpdating}
                        onChange={async (e) => {
                          const next = e.target.value
                          try {
                            await updateStatus({ id: order.id, next }).unwrap()
                          } catch {
                            // error handled by toast in RTK Query middleware if needed
                          }
                        }}
                        className="border border-argos-border rounded px-2 py-1 text-xs"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-argos-gray">
                      <Package size={40} className="mx-auto mb-2 text-argos-gray-light" />
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded border border-argos-border hover:bg-argos-gray-bg disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-argos-gray">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="p-2 rounded border border-argos-border hover:bg-argos-gray-bg disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
