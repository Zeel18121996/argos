import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Heart, MapPin, User, LogOut, ChevronRight } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux'
import { logout } from '@/store/slices/authSlice'
import { PATHS } from '@/constants/path'
import { formatPriceFromPounds } from '@/utils/format'
import { cn } from '@/utils/cn'
import ProductCard from '@/components/Common/ProductCard/ProductCard'

type Tab = 'orders' | 'wishlist' | 'addresses' | 'profile'

const Account: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  // Component state
  const [activeTab, setActiveTab] = useState<Tab>('orders')

  // Redux state
  const { user, isAuthenticated } = useAppSelector((s) => s.auth)
  const wishlistItems = useAppSelector((s) => s.wishlist.items)

  if (!isAuthenticated || !user) {
    return (
      <div className="argos-container py-20 text-center">
        <h2 className="text-xl font-bold text-argos-charcoal mb-2">Please sign in</h2>
        <Link to={PATHS.LOGIN} className="text-argos-blue hover:underline">
          Sign in to your account
        </Link>
      </div>
    )
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate(PATHS.HOME)
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: `Wishlist (${wishlistItems.length})`, icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="argos-container py-6">
      {/* Header */}
      <div className="bg-white border border-argos-border rounded p-5 mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-argos-charcoal">Hi, {user.firstName}!</h1>
          <p className="text-sm text-argos-gray">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-argos-gray hover:text-argos-red transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5">
        {/* Sidebar */}
        <div className="bg-white border border-argos-border rounded overflow-hidden h-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left border-l-4 transition-colors',
                activeTab === tab.id
                  ? 'border-argos-red text-argos-red bg-red-50'
                  : 'border-transparent text-argos-charcoal hover:bg-argos-gray-bg',
              )}
            >
              <tab.icon size={16} />
              {tab.label}
              <ChevronRight size={14} className="ml-auto text-argos-gray-mid" />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white border border-argos-border rounded p-5">
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-base font-bold text-argos-charcoal mb-5">Recent orders</h2>
              {/* Mock orders */}
              {[
                { id: 'ORD-100023', date: '10 May 2026', status: 'Delivered', total: 229.0 },
                { id: 'ORD-099812', date: '02 Apr 2026', status: 'Delivered', total: 549.99 },
              ].map((order) => (
                <div key={order.id} className="border border-argos-border rounded p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-argos-charcoal">{order.id}</span>
                    <span className="text-xs font-bold text-argos-green bg-argos-green-light px-2 py-0.5 rounded">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-argos-gray mb-2">Ordered on {order.date}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-argos-charcoal">
                      {formatPriceFromPounds(order.total)}
                    </span>
                    <button className="text-xs text-argos-blue hover:underline">View order</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 className="text-base font-bold text-argos-charcoal mb-5">
                Saved items ({wishlistItems.length})
              </h2>
              {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {wishlistItems.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart size={40} className="text-argos-gray-light mx-auto mb-3" />
                  <p className="text-sm text-argos-gray">No saved items yet</p>
                  <Link
                    to={PATHS.HOME}
                    className="text-xs text-argos-blue hover:underline mt-1 block"
                  >
                    Start shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h2 className="text-base font-bold text-argos-charcoal mb-5">Saved addresses</h2>
              <div className="border border-dashed border-argos-gray-light rounded p-8 text-center">
                <MapPin size={32} className="text-argos-gray-light mx-auto mb-2" />
                <p className="text-sm text-argos-gray mb-3">No addresses saved yet</p>
                <button className="text-xs font-bold text-argos-blue hover:underline">
                  + Add an address
                </button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="text-base font-bold text-argos-charcoal mb-5">Personal details</h2>
              <div className="grid grid-cols-2 gap-4 max-w-sm">
                <div>
                  <p className="text-xs font-bold text-argos-gray-mid mb-0.5">First name</p>
                  <p className="text-sm text-argos-charcoal">{user.firstName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-argos-gray-mid mb-0.5">Last name</p>
                  <p className="text-sm text-argos-charcoal">{user.lastName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-argos-gray-mid mb-0.5">Email</p>
                  <p className="text-sm text-argos-charcoal">{user.email}</p>
                </div>
              </div>
              <button className="mt-5 text-sm font-bold text-argos-blue hover:underline">
                Edit details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Account
