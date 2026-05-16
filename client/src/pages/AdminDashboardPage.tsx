import { useGetDashboardStatsQuery } from '@/services/adminApi'
import { formatPriceFromPounds } from '@/utils/format'
import { formatDate } from '@/utils/format'
import { Link } from 'react-router-dom'
import { Package, ShoppingCart, PoundSterling, Users, ArrowRight } from 'lucide-react'

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useGetDashboardStatsQuery()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-argos-dark">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's orders"
          value={stats?.todayOrders ?? 0}
          icon={ShoppingCart}
          loading={isLoading}
        />
        <StatCard
          title="Today's revenue"
          value={
            stats?.todayRevenue != null ? formatPriceFromPounds(stats.todayRevenue / 100) : '—'
          }
          icon={PoundSterling}
          loading={isLoading}
        />
        <StatCard
          title="Products"
          value={stats?.totalProducts ?? 0}
          icon={Package}
          loading={isLoading}
        />
        <StatCard
          title="Customers"
          value={stats?.totalCustomers ?? 0}
          icon={Users}
          loading={isLoading}
        />
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-argos-border rounded overflow-hidden">
        <div className="px-4 py-3 border-b border-argos-border flex items-center justify-between">
          <h2 className="font-bold text-argos-dark">Recent orders</h2>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1 text-sm font-bold text-argos-blue hover:underline"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-argos-gray-bg border-b border-argos-border">
            <tr>
              <th className="text-left px-4 py-2 font-bold text-argos-dark">Order</th>
              <th className="text-left px-4 py-2 font-bold text-argos-dark">Status</th>
              <th className="text-right px-4 py-2 font-bold text-argos-dark">Total</th>
              <th className="text-left px-4 py-2 font-bold text-argos-dark">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={4} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-argos-border hover:bg-argos-gray-bg">
                  <td className="px-4 py-3 font-bold text-argos-dark">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-argos-dark">
                    {formatPriceFromPounds(order.total / 100)}
                  </td>
                  <td className="px-4 py-3 text-xs text-argos-gray">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-argos-gray">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string
  value: React.ReactNode
  icon: React.ComponentType<{ size?: number }>
  loading: boolean
}) {
  return (
    <div className="bg-white border border-argos-border rounded p-4 flex items-start justify-between">
      <div>
        <p className="text-xs text-argos-gray font-bold uppercase tracking-wide">{title}</p>
        {loading ? (
          <div className="mt-2 h-6 w-20 bg-gray-200 rounded animate-pulse" />
        ) : (
          <p className="mt-1 text-2xl font-bold text-argos-dark">{value}</p>
        )}
      </div>
      <div className="p-2 bg-argos-gray-bg rounded">
        <Icon size={20} className="text-argos-gray" />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'cancelled' || status === 'refunded'
      ? 'bg-red-100 text-red-700'
      : status === 'delivered'
        ? 'bg-green-100 text-green-700'
        : status === 'shipped'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded uppercase ${color}`}>
      {status}
    </span>
  )
}
