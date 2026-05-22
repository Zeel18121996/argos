import { Link } from 'react-router-dom'
import { Package, Heart, MapPin, User as UserIcon, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGetOrdersQuery } from '@/services/ordersApi'
import { formatPriceFromPounds, formatDateTime } from '@/utils/format'

const QUICK_TILES = [
  {
    to: '/account/orders',
    icon: Package,
    title: 'My orders',
    description: 'Track, return or buy things again',
  },
  {
    to: '/account/wishlist',
    icon: Heart,
    title: 'Wishlist',
    description: 'Items you saved for later',
  },
  {
    to: '/account/profile',
    icon: UserIcon,
    title: 'Profile',
    description: 'Name, email and password',
  },
  {
    to: '/account/profile',
    icon: MapPin,
    title: 'Addresses',
    description: 'Delivery and billing addresses',
  },
] as const

export default function AccountDashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useGetOrdersQuery({ page: 1, limit: 3 })
  const recentOrders = data?.data ?? []

  return (
    <div className="page-container py-10 max-w-5xl mx-auto">
      {/* Greeting */}
      <header className="mb-8">
        <h1 className="text-[28px] font-bold text-argos-charcoal leading-tight">
          Hi, {user?.firstName || 'there'}
        </h1>
        <p className="text-base text-argos-gray mt-1">
          {user?.email}
          {user?.role && user.role !== 'customer' ? (
            <span className="ml-2 inline-block text-xs font-bold uppercase tracking-widest bg-argos-green-light text-argos-green-dark px-2 py-0.5 rounded-sm">
              {user.role}
            </span>
          ) : null}
        </p>
      </header>

      {/* Quick action tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {QUICK_TILES.map(({ to, icon: Icon, title, description }) => (
          <Link
            key={title}
            to={to}
            className="bg-white border border-argos-border rounded-sm p-5 hover:border-argos-blue transition-colors flex flex-col gap-2"
          >
            <Icon size={28} className="text-argos-charcoal" strokeWidth={1.5} />
            <h3 className="text-base font-bold text-argos-charcoal">{title}</h3>
            <p className="text-sm text-argos-gray leading-snug">{description}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-argos-charcoal">Recent orders</h2>
          <Link
            to="/account/orders"
            className="text-sm font-bold text-argos-blue hover:underline flex items-center gap-1"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="bg-white border border-argos-border rounded-sm p-8 text-center">
            <Package size={40} className="text-argos-gray-light mx-auto mb-3" />
            <p className="text-base font-bold text-argos-charcoal mb-1">No orders yet</p>
            <p className="text-sm text-argos-gray mb-4">When you place an order, it will appear here.</p>
            <Link to="/" className="text-sm font-bold text-argos-blue hover:underline">
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/account/orders/${order.id}`}
                  className="block bg-white border border-argos-border rounded-sm px-5 py-4 hover:border-argos-blue transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-sm font-bold text-argos-charcoal">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                        order.status === 'CANCELLED'
                          ? 'bg-red-50 text-argos-red'
                          : 'bg-argos-green-light text-argos-green-dark'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-argos-gray">
                      {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} ·{' '}
                      {formatDateTime(order.createdAt)}
                    </span>
                    <span className="font-bold text-argos-red">
                      {formatPriceFromPounds(order.total / 100)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
