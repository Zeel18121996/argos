import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { RootLayout } from '@/components/layout/RootLayout'

// Lazy-load all pages
const HomePage = lazy(() => import('@/pages/HomePage'))
const BrowsePage = lazy(() => import('@/pages/BrowsePage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const BasketPage = lazy(() => import('@/pages/BasketPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'))
const OrderTrackingPage = lazy(() => import('@/pages/OrderTrackingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const AccountDashboardPage = lazy(() => import('@/pages/AccountDashboardPage'))
const AccountOrdersPage = lazy(() => import('@/pages/AccountOrdersPage'))
const AccountOrderDetailPage = lazy(() => import('@/pages/AccountOrderDetailPage'))
const WishlistPage = lazy(() => import('@/pages/WishlistPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const StoreFinderPage = lazy(() => import('@/pages/StoreFinderPage'))
const HelpPage = lazy(() => import('@/pages/HelpPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Placeholder for pages not yet built
function ComingSoon({ page }: { page: string }) {
  return (
    <div className="page-container py-16 text-center">
      <h1 className="text-2xl font-bold text-argos-gray-800">{page}</h1>
      <p className="mt-2 text-argos-gray-500">Coming in a future phase.</p>
    </div>
  )
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-argos-red border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function wrap(Component: React.LazyExoticComponent<() => JSX.Element>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ── Public ──────────────────────────────────────────────────────────
      { index: true, element: wrap(HomePage) },
      { path: 'browse/*', element: wrap(BrowsePage) },
      { path: 'search/:query', element: wrap(SearchPage) },
      { path: 'product/:id', element: wrap(ProductDetailPage) },
      { path: 'basket', element: wrap(BasketPage) },
      { path: 'order/tracking', element: wrap(OrderTrackingPage) },
      { path: 'stores', element: wrap(StoreFinderPage) },
      { path: 'help', element: wrap(HelpPage) },
      {
        path: 'help/:slug',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ComingSoon page="Help Article" />
          </Suspense>
        ),
      },

      // ── Auth ────────────────────────────────────────────────────────────
      { path: 'auth/login', element: wrap(LoginPage) },
      { path: 'auth/register', element: wrap(RegisterPage) },

      // ── Checkout (protected — Phase 6) ──────────────────────────────────
      { path: 'checkout', element: wrap(CheckoutPage) },
      { path: 'checkout/confirmation/:orderId', element: wrap(OrderConfirmationPage) },

      // ── Account (protected — Phase 7) ───────────────────────────────────
      { path: 'account', element: wrap(AccountDashboardPage) },
      { path: 'account/orders', element: wrap(AccountOrdersPage) },
      { path: 'account/orders/:id', element: wrap(AccountOrderDetailPage) },
      { path: 'account/wishlist', element: wrap(WishlistPage) },
      { path: 'account/profile', element: wrap(ProfilePage) },

      // ── 404 ─────────────────────────────────────────────────────────────
      { path: '*', element: wrap(NotFoundPage) },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
