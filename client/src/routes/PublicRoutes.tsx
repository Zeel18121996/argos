import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PATHS } from '@/constants/path'
import Layout from '@/components/Layouts/Layout'

const Home = lazy(() => import('@/pages/Home/Home'))
const Category = lazy(() => import('@/pages/Category/Category'))
const ProductDetail = lazy(() => import('@/pages/ProductDetail/ProductDetail'))
const SearchResults = lazy(() => import('@/pages/SearchResults/SearchResults'))
const Basket = lazy(() => import('@/pages/Basket/Basket'))
const Checkout = lazy(() => import('@/pages/Checkout/Checkout'))
const Login = lazy(() => import('@/pages/Login/Login'))
const Register = lazy(() => import('@/pages/Register/Register'))
const Account = lazy(() => import('@/pages/Account/Account'))

const Loader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="w-8 h-8 border-3 border-argos-red border-t-transparent rounded-full animate-spin" />
  </div>
)

const PublicRoutes: React.FC = () => (
  <Layout>
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path={PATHS.HOME} element={<Home />} />
        <Route path={PATHS.CATEGORY} element={<Category />} />
        <Route path={PATHS.PRODUCT} element={<ProductDetail />} />
        <Route path={PATHS.SEARCH} element={<SearchResults />} />
        <Route path={PATHS.BASKET} element={<Basket />} />
        <Route path={PATHS.CHECKOUT} element={<Checkout />} />
        <Route path={PATHS.LOGIN} element={<Login />} />
        <Route path={PATHS.REGISTER} element={<Register />} />
        <Route path={PATHS.ACCOUNT} element={<Account />} />
        <Route path={PATHS.ACCOUNT_WISHLIST} element={<Account />} />
        <Route
          path="*"
          element={
            <div className="argos-container py-20 text-center">
              <h2 className="text-2xl font-bold text-argos-charcoal mb-2">Page not found</h2>
              <a href="/" className="text-argos-blue hover:underline">
                Go to home
              </a>
            </div>
          }
        />
      </Routes>
    </Suspense>
  </Layout>
)

export default PublicRoutes
