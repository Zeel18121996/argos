# Argos Clone – System Architecture

## 1. Project Overview

A full-stack e-commerce platform replicating the core functionality of [argos.co.uk](https://www.argos.co.uk/).  
Users can browse a hierarchical product catalogue, search, manage a basket, checkout, track orders, and find stores.

---

## 2. Tech Stack

| Layer                | Technology                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Client**           | React 18 + TypeScript, Vite, React Router v6                                                                                    |
| **State Management** | Redux Toolkit + RTK Query                                                                                                       |
| **Styling**          | TailwindCSS + shadcn/ui                                                                                                         |
| **Server**           | NestJS + TypeScript                                                                                                             |
| **ORM**              | Sequelize 6 + sequelize-typescript + @nestjs/sequelize                                                                          |
| **Primary DB**       | PostgreSQL 16                                                                                                                   |
| **Cache / Sessions** | Redis 7                                                                                                                         |
| **Search**           | PostgreSQL full-text search (phase 1); Elasticsearch (future)                                                                   |
| **File Storage**     | Local `server/uploads/` via Multer + sharp (3 sizes), served at `/static/uploads/` — locked scope decision, no S3/MinIO         |
| **Auth**             | JWT (15 min access in memory + 7-day refresh in httpOnly cookie)                                                                |
| **Payments**         | **Simulated processor** (locked scope decision) — test card `4000000000000002` always fails, all others succeed. No Stripe SDK. |
| **Containerization** | Docker + Docker Compose (postgres, redis, mailhog, server, client)                                                              |
| **API Style**        | REST (versioned: `/api/v1/`)                                                                                                    |

---

## 3. Monorepo Structure

```
argos-clone/
├── client/                   # React frontend
│   ├── public/
│   ├── src/
│   │   ├── app/              # Redux store, RTK Query base
│   │   ├── assets/
│   │   ├── components/       # Shared/reusable UI components
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   └── product/
│   │   ├── features/         # Feature-sliced modules
│   │   │   ├── auth/
│   │   │   ├── basket/
│   │   │   ├── browse/
│   │   │   ├── checkout/
│   │   │   ├── orders/
│   │   │   ├── product/
│   │   │   ├── search/
│   │   │   └── stores/
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Route-level page components
│   │   ├── router/           # React Router config
│   │   ├── services/         # RTK Query API slices
│   │   ├── types/            # Shared TypeScript types/interfaces
│   │   └── utils/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                   # NestJS backend
│   ├── src/
│   │   ├── auth/
│   │   ├── basket/
│   │   ├── categories/
│   │   ├── checkout/
│   │   ├── common/           # Guards, interceptors, pipes, decorators
│   │   ├── config/           # App config, env validation
│   │   ├── database/         # TypeORM config, migrations, seeds
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── products/
│   │   ├── promotions/
│   │   ├── reviews/
│   │   ├── search/
│   │   ├── stores/
│   │   ├── users/
│   │   ├── wishlist/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   ├── nest-cli.json
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── Architecture.md
└── WARP.md
```

---

## 4. Frontend Architecture

### 4.1 Routing (`/client/src/router/`)

| Route                             | Page Component           | Description                                       |
| --------------------------------- | ------------------------ | ------------------------------------------------- |
| `/`                               | `HomePage`               | Hero banner, category carousels, promotions       |
| `/browse/:dept/:category/c::id`   | `BrowsePage`             | Category product listing with filters             |
| `/browse/:dept/c::id`             | `BrowsePage`             | Top-level category listing                        |
| `/search/:query`                  | `SearchPage`             | Search results (same layout as browse)            |
| `/product/:id`                    | `ProductDetailPage`      | Full product info, variants, reviews              |
| `/basket`                         | `BasketPage`             | Shopping trolley / cart                           |
| `/checkout`                       | `CheckoutPage`           | Multi-step checkout (address → payment → confirm) |
| `/checkout/confirmation/:orderId` | `OrderConfirmationPage`  | Order placed success screen                       |
| `/order/tracking`                 | `OrderTrackingPage`      | Track order by order ID + postcode                |
| `/account`                        | `AccountDashboardPage`   | User account overview                             |
| `/account/orders`                 | `AccountOrdersPage`      | Order history list                                |
| `/account/orders/:id`             | `AccountOrderDetailPage` | Single order detail                               |
| `/account/wishlist`               | `WishlistPage`           | Saved items wishlist                              |
| `/account/profile`                | `ProfilePage`            | Edit personal details & addresses                 |
| `/auth/login`                     | `LoginPage`              | Sign in                                           |
| `/auth/register`                  | `RegisterPage`           | Create account                                    |
| `/stores`                         | `StorefinderPage`        | Store locator with map                            |
| `/help`                           | `HelpPage`               | Help centre categories                            |
| `/help/:slug`                     | `HelpArticlePage`        | Individual help article                           |
| `*`                               | `NotFoundPage`           | 404                                               |

### 4.2 State Management

- **Redux Toolkit slices**: auth state (user, tokens), basket (local/synced), UI state (modals, drawers)
- **RTK Query**: all server data fetching — products, categories, search, orders, etc.
- **localStorage**: basket persistence for guest users; auth tokens stored in `httpOnly` cookies (access) + Redux (refresh)

### 4.3 Key Shared Components

| Component                | Purpose                                                                           |
| ------------------------ | --------------------------------------------------------------------------------- |
| `Header`                 | Top bar (Track/Returns/Stores/Help) + logo + nav + search + account + basket icon |
| `MegaMenu`               | Full-width category dropdown triggered from "Shop" nav link                       |
| `Footer`                 | Payment methods, social links, app download, legal links                          |
| `ProductCard`            | Product thumbnail, name, price, rating stars, "Add to trolley" button             |
| `ProductGrid`            | Responsive product card grid layout                                               |
| `FilterBar`              | Sort dropdown + filter chips (Brands, Price, Offers, All filters)                 |
| `FilterDrawer`           | Mobile-friendly filter sidebar/drawer                                             |
| `Breadcrumb`             | Hierarchical breadcrumb navigation                                                |
| `Pagination`             | Page navigation for browse/search                                                 |
| `SearchBar`              | Autocomplete search input                                                         |
| `BasketDrawer`           | Slide-out basket preview                                                          |
| `RatingStars`            | Star rating display                                                               |
| `PriceDisplay`           | Regular/sale price formatting                                                     |
| `ImageGallery`           | Product image carousel/zoom                                                       |
| `QuantitySelector`       | +/- input for basket quantities                                                   |
| `Carousel`               | Horizontal scroll product/promo carousel                                          |
| `Toast` / `Notification` | User feedback snackbars                                                           |
| `Modal`                  | Generic modal wrapper                                                             |
| `ProtectedRoute`         | HOC to guard authenticated routes                                                 |
| `LoadingSkeleton`        | Content placeholder during loading                                                |

---

## 5. Backend Architecture

### 5.1 NestJS Modules

#### `AuthModule`

- `POST /api/v1/auth/register` — create account
- `POST /api/v1/auth/login` — issue JWT pair
- `POST /api/v1/auth/refresh` — rotate refresh token
- `POST /api/v1/auth/logout` — revoke refresh token
- `POST /api/v1/auth/forgot-password` — send reset email
- `POST /api/v1/auth/reset-password` — apply new password

#### `UsersModule`

- `GET /api/v1/users/me` — get current user
- `PATCH /api/v1/users/me` — update profile
- `GET /api/v1/users/me/addresses` — list saved addresses
- `POST /api/v1/users/me/addresses` — add address
- `PATCH /api/v1/users/me/addresses/:id` — update address
- `DELETE /api/v1/users/me/addresses/:id` — remove address

#### `CategoriesModule`

- `GET /api/v1/categories` — full category tree
- `GET /api/v1/categories/:id` — single category
- `GET /api/v1/categories/:id/children` — subcategories
- `POST /api/v1/categories` _(admin)_ — create
- `PATCH /api/v1/categories/:id` _(admin)_ — update
- `DELETE /api/v1/categories/:id` _(admin)_ — delete

#### `ProductsModule`

- `GET /api/v1/products` — list (filtered/sorted/paginated via query params)
- `GET /api/v1/products/:id` — product detail
- `GET /api/v1/products/:id/variants` — product variants
- `GET /api/v1/products/category/:categoryId` — products by category
- `POST /api/v1/products` _(admin)_
- `PATCH /api/v1/products/:id` _(admin)_
- `DELETE /api/v1/products/:id` _(admin)_

**Query params for listing:**
`page`, `limit`, `sortBy` (`price_asc|price_desc|rating|newest`), `brands[]`, `minPrice`, `maxPrice`, `inStock`, `onOffer`

#### `SearchModule`

- `GET /api/v1/search?q=:query&page=&limit=&...` — full-text search with same filter params as products

#### `BasketModule`

- `GET /api/v1/basket` — get current basket (guest via cookie session or user via JWT)
- `POST /api/v1/basket/items` — add item `{ productId, variantId?, quantity }`
- `PATCH /api/v1/basket/items/:itemId` — update quantity
- `DELETE /api/v1/basket/items/:itemId` — remove item
- `DELETE /api/v1/basket` — clear basket
- `POST /api/v1/basket/merge` — merge guest basket into user basket on login

#### `WishlistModule`

- `GET /api/v1/wishlist` _(auth)_
- `POST /api/v1/wishlist/items` — `{ productId }`
- `DELETE /api/v1/wishlist/items/:productId`

#### `CheckoutModule`

- `POST /api/v1/checkout/session` — create checkout session (validates basket, reserves stock)
- `GET /api/v1/checkout/session/:id` — get session state
- `PATCH /api/v1/checkout/session/:id/address` — set delivery address
- `PATCH /api/v1/checkout/session/:id/delivery` — select delivery method
- `POST /api/v1/checkout/session/:id/payment` — process payment intent

#### `OrdersModule`

- `GET /api/v1/orders` _(auth)_ — order history
- `GET /api/v1/orders/:id` _(auth)_ — order detail
- `GET /api/v1/orders/track` — public tracking `?orderId=&postcode=`
- `POST /api/v1/orders` — created internally by checkout
- `PATCH /api/v1/orders/:id/cancel` _(auth)_

#### `ReviewsModule`

- `GET /api/v1/products/:id/reviews` — paginated reviews
- `POST /api/v1/products/:id/reviews` _(auth)_ — submit review
- `DELETE /api/v1/reviews/:id` _(auth/admin)_

#### `StoresModule`

- `GET /api/v1/stores` — all stores (optionally filter by postcode radius)
- `GET /api/v1/stores/:id` — single store detail

#### `PromotionsModule`

- `GET /api/v1/promotions/active` — active promotions/banners
- `POST /api/v1/promotions/validate` — validate discount code `{ code, basketId }`

#### `PaymentsModule` (internal)

- Stripe integration for card payments
- Records payment intent, handles webhooks

---

## 6. Database Schema

### Core Entities

```
users
  id UUID PK
  email VARCHAR UNIQUE NOT NULL
  password_hash VARCHAR NOT NULL
  first_name VARCHAR
  last_name VARCHAR
  phone VARCHAR
  email_verified BOOLEAN DEFAULT false
  created_at TIMESTAMP
  updated_at TIMESTAMP

addresses
  id UUID PK
  user_id UUID FK → users.id
  is_default BOOLEAN
  first_name VARCHAR
  last_name VARCHAR
  line1 VARCHAR
  line2 VARCHAR
  city VARCHAR
  postcode VARCHAR
  country VARCHAR DEFAULT 'GB'

categories
  id UUID PK
  slug VARCHAR UNIQUE
  name VARCHAR
  parent_id UUID FK → categories.id (nullable)
  depth INT DEFAULT 0
  image_url VARCHAR
  sort_order INT
  is_active BOOLEAN DEFAULT true

products
  id UUID PK
  sku VARCHAR UNIQUE
  name VARCHAR NOT NULL
  slug VARCHAR UNIQUE
  description TEXT
  brand VARCHAR
  category_id UUID FK → categories.id
  base_price DECIMAL(10,2)
  sale_price DECIMAL(10,2) nullable
  on_offer BOOLEAN DEFAULT false
  avg_rating DECIMAL(3,2)
  review_count INT DEFAULT 0
  is_active BOOLEAN DEFAULT true
  created_at TIMESTAMP

product_images
  id UUID PK
  product_id UUID FK → products.id
  url VARCHAR
  alt_text VARCHAR
  sort_order INT

product_variants
  id UUID PK
  product_id UUID FK → products.id
  sku VARCHAR UNIQUE
  name VARCHAR           -- e.g. "32GB Black"
  attributes JSONB       -- { "color": "Black", "storage": "32GB" }
  price_adjustment DECIMAL(10,2) DEFAULT 0
  stock_quantity INT DEFAULT 0
  is_active BOOLEAN DEFAULT true

baskets
  id UUID PK
  user_id UUID FK → users.id (nullable for guest)
  session_id VARCHAR (for guest baskets)
  created_at TIMESTAMP
  updated_at TIMESTAMP

basket_items
  id UUID PK
  basket_id UUID FK → baskets.id
  product_id UUID FK → products.id
  variant_id UUID FK → product_variants.id (nullable)
  quantity INT NOT NULL
  unit_price DECIMAL(10,2)   -- price snapshot at time of add
  created_at TIMESTAMP

orders
  id UUID PK
  order_number VARCHAR UNIQUE  -- human-readable e.g. "ORD-20260001"
  user_id UUID FK → users.id (nullable for guest)
  guest_email VARCHAR
  status ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded')
  subtotal DECIMAL(10,2)
  delivery_cost DECIMAL(10,2)
  discount_amount DECIMAL(10,2) DEFAULT 0
  total DECIMAL(10,2)
  payment_intent_id VARCHAR
  payment_status ENUM('pending','paid','failed','refunded')
  delivery_method VARCHAR
  delivery_address JSONB
  tracking_number VARCHAR
  notes TEXT
  created_at TIMESTAMP
  updated_at TIMESTAMP

order_items
  id UUID PK
  order_id UUID FK → orders.id
  product_id UUID FK → products.id
  variant_id UUID FK → product_variants.id (nullable)
  product_name VARCHAR   -- snapshot
  variant_name VARCHAR   -- snapshot
  quantity INT
  unit_price DECIMAL(10,2)
  total_price DECIMAL(10,2)

reviews
  id UUID PK
  product_id UUID FK → products.id
  user_id UUID FK → users.id
  rating INT CHECK(1..5)
  title VARCHAR
  body TEXT
  is_verified_purchase BOOLEAN DEFAULT false
  created_at TIMESTAMP

wishlist_items
  id UUID PK
  user_id UUID FK → users.id
  product_id UUID FK → products.id
  created_at TIMESTAMP
  UNIQUE(user_id, product_id)

stores
  id UUID PK
  name VARCHAR
  address_line1 VARCHAR
  city VARCHAR
  postcode VARCHAR
  phone VARCHAR
  latitude DECIMAL(9,6)
  longitude DECIMAL(9,6)
  opening_hours JSONB  -- { "mon": "09:00-20:00", ... }
  is_active BOOLEAN DEFAULT true

promotions
  id UUID PK
  type ENUM('banner','discount_code','percentage_off','amount_off','free_delivery')
  code VARCHAR UNIQUE (nullable for banners)
  title VARCHAR
  description TEXT
  image_url VARCHAR
  link_url VARCHAR
  discount_value DECIMAL(10,2)
  min_basket_value DECIMAL(10,2)
  max_uses INT
  uses_count INT DEFAULT 0
  starts_at TIMESTAMP
  ends_at TIMESTAMP
  is_active BOOLEAN DEFAULT true

refresh_tokens
  id UUID PK
  user_id UUID FK → users.id
  token_hash VARCHAR UNIQUE
  expires_at TIMESTAMP
  revoked BOOLEAN DEFAULT false
  created_at TIMESTAMP
```

---

## 7. Key Architectural Decisions

### 7.1 Authentication Flow

1. Login → server returns `accessToken` (15 min) in response body + `refreshToken` (7 days) in `HttpOnly` cookie
2. Client stores `accessToken` in Redux memory only (never localStorage)
3. RTK Query `baseQuery` wraps all requests; on 401, auto-calls `/auth/refresh` and retries once
4. Guest basket stored in Redis by `sessionId` cookie; merged to user basket on login

### 7.2 Basket Strategy

- Guest users: Redis-backed basket keyed by `sessionId`
- Authenticated users: Postgres-backed basket synced via API
- Optimistic UI updates with RTK Query cache invalidation

### 7.3 Category Tree

- Stored as adjacency list in Postgres (self-referential `parent_id`)
- Full tree fetched once and cached in Redux on app load; depth max 4 levels
- Mega-menu built client-side from cached tree

### 7.4 Product Filtering

- All filtering done server-side via query params
- PostgreSQL `tsvector` + `tsquery` for text search (phase 1)
- Price range via `BETWEEN`, brand filtering via `ANY(array)`, in-stock via `stock_quantity > 0`

### 7.5 Images

- **Local filesystem** (`server/uploads/`) — direct Multer upload, sharp generates 3 sizes (300², 600², 1200²)
- Served by NestJS as static files at `/static/uploads/<filename>`
- DB stores the path relative to `/static/uploads/`; frontend prefixes with the static origin

### 7.6 Payments (simulated)

- No external payment provider
- `POST /api/v1/payments/charge` accepts `{ cardNumber, expiry, cvc, amount }`
- Test card `4000000000000002` → always returns `{ status: 'failed' }`. All other cards → `{ status: 'succeeded' }` with a stub `paymentIntentId`
- An internal `POST /api/v1/payments/webhook` endpoint advances order status (pending → confirmed → processing → shipped → delivered) — triggered by admin actions or scheduled simulator

---

## 8. API Response Conventions

### Pagination Envelope

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 30,
    "total": 89,
    "totalPages": 3
  }
}
```

### Error Shape

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "must be a valid email" }],
  "timestamp": "2026-05-15T07:00:00Z",
  "path": "/api/v1/auth/register"
}
```

### Success Shape

```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

---

## 9. Infrastructure (Docker Compose)

```yaml
services:
  client: # React dev server (port 3000)
  server: # NestJS app (port 4000)
  postgres: # PostgreSQL 16 (port 5432)
  redis: # Redis 7 (port 6379)
  mailhog: # SMTP catch-all for local dev email (1025 SMTP / 8025 Web UI)
```

### Environment Variables (`.env`)

```
# Server
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://argos:argos@postgres:5432/argos
REDIS_URL=redis://redis:6379
JWT_ACCESS_SECRET=replace-me-32-chars
JWT_REFRESH_SECRET=replace-me-32-chars
SMTP_HOST=mailhog
SMTP_PORT=1025
CLIENT_URL=http://localhost:3000
UPLOAD_DIR=./uploads
STATIC_PREFIX=/static

# Client
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

---

## 10. Development Phases

> Full phase plan is in `C:\Users\zeel.patel\.claude\plans\first-check-all-skills-twinkling-map.md`. Summary below.

- **Phase 0** — Foundations: git init, Conventional Commits + Husky, MailHog service, port alignment, 5 new skill files, refresh existing skill files.
- **Phase 1** — Auth & Users: register/login, JWT 15-min + 7-day refresh in cookie, roles (`customer`/`staff`/`admin`), `ProtectedRoute`/`StaffRoute`/`AdminRoute`.
- **Phase 2** — Catalogue: products/variants/images, browse with full filters, search via Postgres FTS, PDP, admin products CRUD with image uploader.
- **Phase 3** — Basket & Wishlist: guest basket (Redis sessionId), user basket (Postgres), merge-on-login, optimistic UI.
- **Phase 4** — Checkout, Orders, Payments: 3-step checkout, simulated card processor (`4000000000000002` fails), order list/detail, public tracking, admin orders table + status timeline.
- **Phase 5** — Admin lean v1: dashboard stat cards, customers table + detail drawer, categories flat list with numeric `sort_order` (no drag-reorder).
- **Phase 6** — Enrichment: reviews + moderation, promotions (banners + codes), static stores list, markdown help articles.
- **Phase 7** — Polish: skeletons everywhere, error boundaries, WCAG AA, Lighthouse ≥90/95/95, MailHog email templates, README, Vitest + Jest coverage ≥70 % on services/hooks/utils, tag `v1.0.0`.
