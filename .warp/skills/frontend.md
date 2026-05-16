# Skill: Argos Clone – Frontend (React + RTK Query + TailwindCSS)

## When to use this skill

Read this skill before implementing any client-side feature in `client/`.

---

## Tech Stack Versions (as of the current scaffold)

- React 19.x
- TypeScript 6.x (strict)
- Vite 8.x
- React Router v7 (`createBrowserRouter`)
- Redux Toolkit 2.x (`@reduxjs/toolkit`) — RTK Query built in
- TailwindCSS 4.x (with `@tailwindcss/vite` plugin — no separate `tailwind.config.ts`; tokens in `@theme` block inside `client/src/index.css`)
- Headless UI primitives via Radix (install as needed; no global shadcn/ui CLI in this scaffold)
- Vitest + React Testing Library (set up in Phase 7)

---

## Project Structure Quick Reference

```
client/src/
├── app/
│   ├── store.ts           # configureStore
│   └── baseApi.ts         # RTK Query createApi base
├── components/
│   ├── common/            # Button, Input, Modal, Toast, Skeleton…
│   ├── layout/            # Header, Footer, MegaMenu, Breadcrumb
│   └── product/           # ProductCard, ProductGrid, FilterBar, RatingStars, PriceDisplay
├── features/
│   ├── auth/              # authSlice.ts, LoginForm.tsx, RegisterForm.tsx
│   ├── basket/            # basketSlice.ts, BasketDrawer.tsx, BasketItem.tsx
│   ├── browse/            # FilterBar.tsx, FilterDrawer.tsx, Pagination.tsx
│   ├── checkout/          # checkoutSlice.ts, AddressStep.tsx, PaymentStep.tsx
│   ├── orders/            # OrderCard.tsx, OrderTimeline.tsx
│   ├── product/           # ImageGallery.tsx, VariantSelector.tsx, ReviewList.tsx
│   ├── search/            # SearchBar.tsx, SearchSuggestions.tsx
│   └── stores/            # StoreMap.tsx, StoreCard.tsx
├── hooks/                 # useBasket.ts, useAuth.ts, useDebounce.ts, useIntersectionObserver.ts
├── pages/                 # Route-level components (lazy-loaded)
├── router/
│   └── index.tsx          # All route definitions
├── services/              # RTK Query API slices (productsApi, categoriesApi, ordersApi…)
├── types/                 # Shared TS types/interfaces
└── utils/
    ├── formatPrice.ts     # pence → "£X.XX"
    ├── formatDate.ts
    └── cn.ts              # tailwind-merge + clsx helper
```

---

## Redux Store Setup

```typescript
// app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from './baseApi'
import authReducer from '../features/auth/authSlice'
import basketReducer from '../features/basket/basketSlice'
import uiReducer from '../features/ui/uiSlice'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    basket: basketReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

```typescript
// app/baseApi.ts — CURRENT IMPLEMENTATION (already unwraps NestJS envelope)
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import type { RootState } from './store'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) headers.set('authorization', `Bearer ${token}`)
    return headers
  },
})

// Server wraps success responses as { data, message, timestamp } — this unwraps so
// hooks return the inner payload directly (Category[] not { data: Category[] }).
const baseQueryWithUnwrap: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  if (result.data && typeof result.data === 'object' && 'data' in result.data) {
    return { ...result, data: (result.data as { data: unknown }).data }
  }
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithUnwrap,
  tagTypes: [
    'Product',
    'Category',
    'Basket',
    'Order',
    'Review',
    'Wishlist',
    'User',
    'Promotion',
    'Store',
    'Help',
  ],
  endpoints: () => ({}), // injected per feature
})
```

**Do NOT replace this.** Phase 1 will wrap it with a 401-refresh interceptor; everything else stays.

---

## RTK Query API Slice Pattern

```typescript
// services/productsApi.ts
import { baseApi } from '../app/baseApi'
import type { Product, PaginatedResponse, ProductFilters } from '../types'

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedResponse<Product>, ProductFilters>({
      query: (filters) => ({ url: '/products', params: filters }),
      providesTags: ['Product'],
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Product', id }],
    }),
    addProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: ['Product'],
    }),
  }),
})

export const { useGetProductsQuery, useGetProductByIdQuery, useAddProductMutation } = productsApi
```

---

## Component Patterns

### Standard component file

```typescript
// components/product/ProductCard.tsx
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { PriceDisplay } from './PriceDisplay';
import { RatingStars } from './RatingStars';
import { useAddToBasketMutation } from '../../services/basketApi';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAddToBasket?: (productId: string) => void;
}

export function ProductCard({ product, onAddToBasket }: ProductCardProps) {
  const [addToBasket, { isLoading }] = useAddToBasketMutation();

  const handleAdd = async () => {
    await addToBasket({ productId: product.id, quantity: 1 });
    onAddToBasket?.(product.id);
  };

  return (
    <div className="group relative flex flex-col rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
      <Link to={`/product/${product.id}`} className="flex-1">
        <img
          src={product.images[0]?.url}
          alt={product.name}
          className="aspect-square w-full object-contain"
        />
        <h3 className="mt-2 text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h3>
        <RatingStars rating={product.avgRating} count={product.reviewCount} />
        <PriceDisplay basePrice={product.basePrice} salePrice={product.salePrice} />
      </Link>
      <button
        onClick={handleAdd}
        disabled={isLoading}
        className="mt-3 w-full rounded-md bg-argos-red px-4 py-2 text-sm font-semibold text-white hover:bg-argos-red-dark disabled:opacity-50"
      >
        {isLoading ? 'Adding…' : 'Add to trolley'}
      </button>
    </div>
  );
}
```

### Loading skeleton

```typescript
// Always show skeleton while loading, not a spinner
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col rounded-lg border border-gray-200 bg-white p-4">
      <div className="aspect-square w-full bg-gray-200 rounded" />
      <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
      <div className="mt-1 h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}
```

---

## Routing

```typescript
// router/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RootLayout } from '../components/layout/RootLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { PageSkeleton } from '../components/common/PageSkeleton';

const HomePage = lazy(() => import('../pages/HomePage'));
const BrowsePage = lazy(() => import('../pages/BrowsePage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const BasketPage = lazy(() => import('../pages/BasketPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
// ... etc

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Suspense fallback={<PageSkeleton />}><HomePage /></Suspense> },
      { path: '/browse/*', element: <Suspense fallback={<PageSkeleton />}><BrowsePage /></Suspense> },
      { path: '/product/:id', element: <Suspense fallback={<PageSkeleton />}><ProductDetailPage /></Suspense> },
      { path: '/search/:query', element: <Suspense fallback={<PageSkeleton />}><SearchPage /></Suspense> },
      { path: '/basket', element: <Suspense fallback={<PageSkeleton />}><BasketPage /></Suspense> },
      {
        path: '/checkout',
        element: <ProtectedRoute><Suspense fallback={<PageSkeleton />}><CheckoutPage /></Suspense></ProtectedRoute>,
      },
      { path: '/auth/login', element: <Suspense fallback={<PageSkeleton />}><LoginPage /></Suspense> },
      // ... etc
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
```

---

## Key Custom Hooks

```typescript
// hooks/useAuth.ts
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../app/store'
import { clearAuth } from '../features/auth/authSlice'
import { useLogoutMutation } from '../services/authApi'

export function useAuth() {
  const dispatch = useDispatch()
  const user = useSelector((s: RootState) => s.auth.user)
  const isAuthenticated = !!user
  const [logoutMutation] = useLogoutMutation()

  const logout = async () => {
    await logoutMutation()
    dispatch(clearAuth())
  }

  return { user, isAuthenticated, logout }
}
```

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
```

---

## Price Formatting

```typescript
// utils/formatPrice.ts
// Prices are stored in PENCE (integers). Always convert for display.
export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}

// In component:
// <span>{formatPrice(product.basePrice)}</span>  → "£29.99"
```

---

## TailwindCSS Conventions

Argos brand config expected in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      argos: {
        red: '#e41b23',
        'red-dark': '#b51219',
        blue: '#0033a0',
        yellow: '#ffcc00',
        gray: {
          light: '#f5f5f5',
          DEFAULT: '#767676',
          dark: '#333333',
        },
      },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
  },
}
```

Common utility patterns used in this project:

- Card: `rounded-lg border border-gray-200 bg-white p-4 shadow-sm`
- Button primary: `bg-argos-red text-white px-4 py-2 rounded-md font-semibold hover:bg-argos-red-dark`
- Button secondary: `border border-argos-red text-argos-red px-4 py-2 rounded-md font-semibold hover:bg-red-50`
- Container: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`
- Grid: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`

---

## Common Pitfalls

- Do NOT call `refetch()` manually to refresh after a mutation — use `invalidatesTags` in the mutation definition instead.
- Do NOT store price values as floats. All prices are integer pence on the wire. Convert only for display.
- Do NOT use `useEffect` to trigger API calls. Use RTK Query `useQuery`/`useMutation` hooks.
- Do NOT add `key={index}` to lists of products/orders — use stable IDs (`key={product.id}`).
- The basket icon in the header should read its count from the Redux `basket` slice, not re-fetch from the server on every render.
