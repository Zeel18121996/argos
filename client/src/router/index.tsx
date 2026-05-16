import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense, type ReactElement } from 'react'
import { RootLayout } from '@/components/layout/RootLayout'
import { ProtectedRoute } from '@/components/Common/ProtectedRoute'
import { StaffRoute } from '@/components/Common/StaffRoute'

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
const AdminProductsPage = lazy(() => import('@/pages/AdminProductsPage'))
const AdminProductFormPage = lazy(() => import('@/pages/AdminProductFormPage'))

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

function wrap(Component: React.LazyExoticComponent<() => ReactElement>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

function protectedWrap(Component: React.LazyExoticComponent<() => ReactElement>) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </ProtectedRoute>
  )
}

function adminWrap(Component: React.LazyExoticComponent<() => ReactElement>) {
  return (
    <StaffRoute>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </StaffRoute>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ── Public ──────────────────────────────────────────────────────────
      { index: true, element: wrap(HomePage) },
      { path: 'browse/*', element: wrap(BrowsePage) },
      { path: 'search', element: wrap(SearchPage) },
      { path: 'product/:slug', element: wrap(ProductDetailPage) },
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

      // ── Auth (public — also accepts ?successUrl=/path for redirects) ─────
      { path: 'auth/login', element: wrap(LoginPage) },
      { path: 'auth/register', element: wrap(RegisterPage) },
      {
        path: 'auth/forgot-password',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ComingSoon page="Forgot password" />
          </Suspense>
        ),
      },
      {
        path: 'auth/reset-password',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ComingSoon page="Reset password" />
          </Suspense>
        ),
      },

      // ── Checkout (protected) ────────────────────────────────────────────
      { path: 'checkout', element: protectedWrap(CheckoutPage) },
      { path: 'checkout/confirmation/:orderId', element: protectedWrap(OrderConfirmationPage) },

      // ── Account (protected) ─────────────────────────────────────────────
      { path: 'account', element: protectedWrap(AccountDashboardPage) },
      { path: 'account/orders', element: protectedWrap(AccountOrdersPage) },
      { path: 'account/orders/:id', element: protectedWrap(AccountOrderDetailPage) },
      { path: 'account/wishlist', element: protectedWrap(WishlistPage) },
      { path: 'account/profile', element: protectedWrap(ProfilePage) },

      // ── Admin (staff/admin only) ────────────────
      { path: 'admin', element: adminWrap(AdminProductsPage) },
      { path: 'admin/products', element: adminWrap(AdminProductsPage) },
      { path: 'admin/products/new', element: adminWrap(AdminProductFormPage) },
      { path: 'admin/products/:id/edit', element: adminWrap(AdminProductFormPage) },

      // ── 404 ─────────────────────────────────────────────────────────────
      { path: '*', element: wrap(NotFoundPage) },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
