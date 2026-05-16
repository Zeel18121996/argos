# Skill: Argos Clone — API Contracts

## When to use this skill

Read this whenever wiring a new endpoint or RTK Query slice. This is the **single source of truth** for request shapes, response shapes, and error codes. Endpoints listed in `Architecture.md` and `backend.md` are summaries; this file fills in the detail.

---

## Envelope conventions

### Success

The server wraps every successful response via `ResponseWrapperInterceptor`:

```json
{
  "data": <T>,
  "message": "OK",
  "timestamp": "2026-05-16T10:23:00.000Z"
}
```

The client `baseApi` automatically unwraps so RTK Query hooks receive `T` directly. **Define DTOs in `client/src/types/api.ts` as the unwrapped shape** — don't include the envelope.

### Paginated list

```json
{
  "data": {
    "data": [<T>, <T>, ...],
    "meta": { "page": 1, "limit": 30, "total": 89, "totalPages": 3 }
  },
  "message": "OK",
  "timestamp": "..."
}
```

After unwrap: `{ data: T[]; meta: { page, limit, total, totalPages } }`.

TypeScript helper:

```ts
// client/src/types/api.ts
export interface Paginated<T> {
  data: T[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
```

### Error

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "must be a valid email" }],
  "timestamp": "...",
  "path": "/api/v1/auth/register"
}
```

`errors[]` only present for validation failures. For other errors (404, 401, 500), `errors` is omitted; only `statusCode` + `message` are guaranteed.

---

## Auth (`/api/v1/auth`)

### `POST /auth/register`

**Body:**

```ts
{
  email: string
  password: string
  firstName: string
  lastName: string
}
```

- `email`: valid email, unique
- `password`: min 8, must contain a letter + a number
- `firstName`, `lastName`: 1–80 chars, trimmed

**200:** `{ id: string; email: string; firstName: string; lastName: string }`
**409:** `{ statusCode: 409, message: "Email already registered" }`

### `POST /auth/login`

**Body:** `{ email: string; password: string }`
**200:**

```ts
{ accessToken: string; user: { id, email, firstName, lastName, role: 'customer'|'staff'|'admin' } }
```

Sets `refreshToken` httpOnly cookie (7 d, `SameSite=Lax`, `Secure` in prod).
**401:** invalid credentials.
**403:** account deactivated.

### `POST /auth/refresh`

No body — reads refresh cookie.
**200:** `{ accessToken }` (same shape as login response). Rotates the refresh cookie.
**401:** missing/revoked/expired refresh token.

### `POST /auth/logout`

**200:** `{ ok: true }`. Revokes the refresh row, clears the cookie.

### `POST /auth/forgot-password`

**Body:** `{ email }` — always returns 200 (don't leak whether the email exists). Sends a reset email via MailHog with a token.

### `POST /auth/reset-password`

**Body:** `{ token: string; password: string }`
**200:** `{ ok: true }`
**400:** token expired / invalid.

---

## Users (`/api/v1/users`)

### `GET /users/me` _(auth)_

**200:**

```ts
{ id, email, firstName, lastName, phone?, role, emailVerified, createdAt }
```

### `PATCH /users/me` _(auth)_

**Body (any subset):** `{ firstName?, lastName?, phone? }`
**200:** updated user (same shape as GET /me).

### `GET /users/me/addresses` _(auth)_

**200:**

```ts
Address[]
// Address: { id, isDefault, firstName, lastName, line1, line2?, city, postcode, country }
```

### `POST /users/me/addresses` _(auth)_

**Body:** `Omit<Address, 'id'>`. `isDefault: true` unsets others.
**200:** the new Address.

### `PATCH /users/me/addresses/:id` _(auth)_

**Body:** `Partial<Omit<Address, 'id'>>`
**200:** updated Address.

### `DELETE /users/me/addresses/:id` _(auth)_

**204** on success.

---

## Categories (`/api/v1/categories`)

### `GET /categories` _(public)_

**Query:** none.
**200:** `CategoryNode[]` — tree, depth-first.

```ts
interface CategoryNode {
  id: string
  slug: string
  name: string
  depth: number
  imageUrl?: string
  sortOrder: number
  isActive: boolean
  children: CategoryNode[]
}
```

### `GET /categories/:id` _(public)_

**200:** `CategoryNode` (without children — single-node fetch).

### `POST /categories` _(staff)_

**Body:** `{ slug, name, parentId?: string, imageUrl?, sortOrder?: number }`
**200:** the new Category.

### `PATCH /categories/:id` _(staff)_

**Body:** partial Category.
**200:** updated Category.

### `DELETE /categories/:id` _(staff)_

Soft-delete: sets `isActive = false`.
**204** on success.

---

## Products (`/api/v1/products`)

### `GET /products` _(public)_

**Query DTO:**

```ts
{
  page?: number = 1;          // ≥ 1
  limit?: number = 30;        // 1..100
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  brands?: string[];          // comma-separated in query string, normalised to array
  minPrice?: number;          // pence
  maxPrice?: number;          // pence
  inStock?: boolean;
  onOffer?: boolean;
  categoryId?: string;        // single category filter
}
```

**200:** `Paginated<ProductSummary>`

```ts
interface ProductSummary {
  id: string
  sku: string
  name: string
  slug: string
  brand: string
  categoryId: string
  basePrice: number // pence
  salePrice?: number // pence
  onOffer: boolean
  avgRating: number // 0..5, one decimal
  reviewCount: number
  images: { id: string; url: string; altText?: string }[] // first image is primary
  isActive: boolean
}
```

### `GET /products/:id` _(public)_

**200:** `ProductDetail = ProductSummary & { description: string; specs: Record<string,string>; variants: ProductVariant[] }`

```ts
interface ProductVariant {
  id: string
  sku: string
  name: string
  attributes: Record<string, string> // e.g. { color: 'Black', storage: '32GB' }
  priceAdjustment: number // pence (added to basePrice)
  stockQuantity: number
  isActive: boolean
}
```

### `POST /products` _(staff)_

**Body:**

```ts
{
  name: string; description?: string; brand: string; categoryId: string;
  basePrice: number;      // pence
  salePrice?: number;     // pence
  sku?: string;           // auto-generated if missing
  specs?: Record<string,string>;
}
```

**200:** the created ProductDetail (with empty `images: []` and `variants: []`).

### `PATCH /products/:id` _(staff)_

**Body:** partial create body.
**200:** updated ProductDetail.

### `DELETE /products/:id` _(staff)_

Soft-delete (`isActive = false`).
**204** on success.

### `POST /admin/products/:id/images` _(staff, multipart)_

**Body:** form-data with one or more `files` keys (jpeg/png/webp ≤ 5 MB each).
sharp generates 3 sizes; only the largest URL is stored in `product_images.url`. The smaller paths are derived (`<filename>.300.webp`, `.600.webp`).
**200:** `ProductImage[]` — the inserted rows.

### `PATCH /admin/products/:id/images/order` _(staff)_

**Body:** `{ ids: string[] }` — new order.
**200:** updated `ProductImage[]`.

### `DELETE /admin/products/:id/images/:imageId` _(staff)_

**204** on success. Removes the row and unlinks the files.

---

## Search (`/api/v1/search`)

### `GET /search` _(public)_

**Query:** `q: string` + every filter from `GET /products`.
**200:** `Paginated<ProductSummary>` + `{ suggestions?: string[] }` if `q` had < 3 results.

### `GET /search/suggestions` _(public)_

**Query:** `q: string` (min 2 chars).
**200:** `{ products: ProductSummary[] /* max 8 */; categories: { id, name, slug }[] /* max 4 */ }`.

---

## Basket (`/api/v1/basket`)

Guest baskets are keyed by a `sessionId` cookie (set by server on first call). Authenticated baskets are keyed by `user.id`.

### `GET /basket`

**200:** `Basket`

```ts
interface Basket {
  id: string
  items: BasketItem[]
  itemCount: number // sum of quantities
  subtotal: number // pence
}
interface BasketItem {
  id: string
  productId: string
  variantId?: string
  product: ProductSummary
  variant?: ProductVariant
  quantity: number
  unitPrice: number // pence, snapshot at add time
  lineTotal: number // pence
}
```

### `POST /basket/items`

**Body:** `{ productId: string; variantId?: string; quantity: number }`
**200:** updated `Basket`.

### `PATCH /basket/items/:itemId`

**Body:** `{ quantity: number }`
**200:** updated `Basket`. Quantity 0 removes the item.

### `DELETE /basket/items/:itemId`

**200:** updated `Basket`.

### `DELETE /basket`

**200:** empty `Basket`.

### `POST /basket/merge` _(auth, called automatically on login)_

Merges guest basket (via cookie) into user basket. Combines quantities of identical (productId, variantId) lines.
**200:** merged `Basket`.

---

## Wishlist (`/api/v1/wishlist`) _(auth)_

### `GET /wishlist`

**200:** `WishlistItem[]`

```ts
interface WishlistItem {
  id: string
  product: ProductSummary
  createdAt: string
}
```

### `POST /wishlist/items`

**Body:** `{ productId: string }`
**200:** the new `WishlistItem`. Idempotent — returns existing if already present.

### `DELETE /wishlist/items/:productId`

**204** on success.

---

## Checkout (`/api/v1/checkout`)

Multi-step session. The session holds the basket snapshot, selected address, delivery method, and payment outcome.

### `POST /checkout/session` _(auth or guest)_

Creates a session from the current basket. **Body:** `{}`.
**200:** `CheckoutSession`

```ts
interface CheckoutSession {
  id: string
  basket: Basket
  step: 'address' | 'delivery' | 'payment' | 'confirmed'
  address?: Address
  deliveryMethod?: { id: string; name: string; cost: number; etaDays: number }
  paymentStatus?: 'pending' | 'paid' | 'failed'
  total?: number // pence
  orderId?: string
}
```

### `GET /checkout/session/:id`

**200:** `CheckoutSession`.

### `PATCH /checkout/session/:id/address`

**Body:** `Address` (or `{ addressId: string }` to reuse a saved one).
**200:** session advanced to `step: 'delivery'`.

### `PATCH /checkout/session/:id/delivery`

**Body:** `{ methodId: string }` — one of `'standard' | 'next_day' | 'click_collect'`.
**200:** session advanced to `step: 'payment'`.

### `POST /checkout/session/:id/payment`

**Body:** `{ cardNumber: string; expiry: string; cvc: string }`

- Test card `4000000000000002` → 200 with `paymentStatus: 'failed'` (no order created).
- Any other valid-looking card → 200 with `paymentStatus: 'paid'`, session advances to `confirmed`, order is created, `orderId` is set, confirmation email queued.
  **400:** card validation failed (Luhn check, expiry in past).

---

## Orders (`/api/v1/orders`)

### `GET /orders` _(auth, customer scope)_

**Query:** `page`, `limit`.
**200:** `Paginated<OrderSummary>`

```ts
interface OrderSummary {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  itemCount: number
  createdAt: string
}
type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
```

### `GET /orders/:id` _(auth)_

**200:** `OrderDetail = OrderSummary & { items: OrderItem[]; deliveryAddress: Address; paymentStatus: ..., trackingNumber?: string }`

### `GET /orders/track` _(public)_

**Query:** `orderNumber: string; postcode: string`
**200:** `{ status, statusHistory: [{ status, at }], trackingNumber? }`
**404:** order not found OR postcode mismatch (intentionally vague to avoid enumeration).

### `PATCH /orders/:id/cancel` _(auth)_

Only allowed before `processing`.
**200:** updated order; status now `cancelled`.

### Admin order endpoints

### `GET /admin/orders` _(staff)_

**Query:** `page`, `limit`, `status?`, `q?` (matches orderNumber or customer email), `from?`, `to?` (ISO date).
**200:** `Paginated<OrderSummary & { customerEmail: string }>`.

### `PATCH /admin/orders/:id/status` _(staff)_

**Body:** `{ next: OrderStatus; trackingNumber?: string; note?: string }`

- Server validates the transition (e.g. can't go from `delivered` back to `pending`).
- Emits `mailhog` email on `shipped` and `delivered`.
  **200:** updated `OrderDetail`.
  **400:** invalid transition.

---

## Admin Users (`/api/v1/admin/users`)

### `GET /admin/users` _(admin)_

**Query:** `page`, `limit`, `role?`, `status?` (`active`/`deactivated`), `q?` (matches email or name).
**200:** `Paginated<AdminUserSummary>`

```ts
interface AdminUserSummary {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'customer' | 'staff' | 'admin'
  isActive: boolean
  orderCount: number
  lifetimeValue: number // pence
  createdAt: string
}
```

### `GET /admin/users/:id` _(admin)_

**200:** `AdminUserSummary & { addresses: Address[]; recentOrders: OrderSummary[] }`.

### `PATCH /admin/users/:id/status` _(admin)_

**Body:** `{ isActive: boolean }`
**200:** updated `AdminUserSummary`.

### `PATCH /admin/users/:id/role` _(admin)_

**Body:** `{ role: 'customer'|'staff'|'admin' }`
**200:** updated `AdminUserSummary`. User must re-login for the new role to take effect (their current JWT still carries the old role until expiry — surface this in the UI).

---

## Admin Dashboard (`/api/v1/admin/dashboard`)

### `GET /admin/dashboard/stats` _(staff)_

**200:**

```ts
{
  todayOrders: number;
  todayRevenue: number;       // pence
  totalProducts: number;
  totalCustomers: number;
  recentOrders: OrderSummary[];   // last 10
}
```

---

## Reviews (`/api/v1/reviews`) _(Phase 6)_

### `GET /products/:id/reviews` _(public)_

**Query:** `page`, `limit`.
**200:** `Paginated<Review> & { ratingHistogram: { 1: number; 2: number; 3: number; 4: number; 5: number } }`

```ts
interface Review {
  id: string
  productId: string
  userId: string
  userFirstName: string
  rating: number
  title: string
  body: string
  isVerifiedPurchase: boolean
  createdAt: string
}
```

### `POST /products/:id/reviews` _(auth)_

**Body:** `{ rating: number; title: string; body: string }`
Requires that the user has at least one `delivered` order containing this product. Goes into a `pending` state for staff moderation.
**200:** the pending Review (not visible on PDP until approved).
**403:** user has no delivered order with this product.

### `PATCH /admin/reviews/:id` _(staff)_

**Body:** `{ status: 'approved' | 'rejected' }`
**200:** updated Review.

---

## Promotions (`/api/v1/promotions`) _(Phase 6)_

### `GET /promotions/active` _(public)_

**200:** `Banner[]` — type `'banner'` promotions currently within their date range.

### `POST /promotions/validate` _(public)_

**Body:** `{ code: string; basketSubtotal: number }`
**200:** `{ valid: true; discountAmount: number; description: string }` or `{ valid: false; reason: string }`.

### Admin promotions CRUD: same shape as products (POST/PATCH/DELETE under `@Roles('staff')`).

---

## Stores (`/api/v1/stores`) _(Phase 6, static list)_

### `GET /stores` _(public)_

**Query:** `city?`, `q?` (matches name or postcode).
**200:** `Store[]`

```ts
interface Store {
  id: string
  name: string
  addressLine1: string
  city: string
  postcode: string
  phone?: string
  openingHours: Record<string, string> // { mon: '09:00-20:00', ... }
}
```

### `GET /stores/:id` _(public)_

**200:** `Store`.

---

## Help (`/api/v1/help`) _(Phase 6)_

### `GET /help/articles` _(public)_

**Query:** `q?`, `category?`.
**200:** `HelpArticleSummary[]`

```ts
interface HelpArticleSummary {
  slug: string
  title: string
  category: string
  updatedAt: string
}
```

### `GET /help/articles/:slug` _(public)_

**200:** `HelpArticle = HelpArticleSummary & { bodyHtml: string }` (markdown → HTML via gray-matter + remark, sanitised).

---

## Rate Limits

Default: 100 requests / min / IP via `@nestjs/throttler` (already configured globally).

Overrides:

| Endpoint group               | Limit           |
| ---------------------------- | --------------- |
| `POST /auth/login`           | 5 / 5 min / IP  |
| `POST /auth/register`        | 5 / 5 min / IP  |
| `POST /auth/forgot-password` | 3 / 15 min / IP |
| Admin login routes           | 3 / 5 min / IP  |

Beyond the limit: 429 with `{ statusCode: 429, message: 'Too many requests' }`.

---

## Error code catalogue

| Code | Meaning           | When                                                  |
| ---- | ----------------- | ----------------------------------------------------- |
| 400  | Validation failed | DTO failed `class-validator`                          |
| 401  | Unauthenticated   | Missing/invalid access token                          |
| 403  | Forbidden         | Auth OK but role/ownership check failed               |
| 404  | Not found         | Record missing (or hidden by `isActive=false`)        |
| 409  | Conflict          | Unique constraint (e.g. duplicate email)              |
| 422  | Unprocessable     | Business-rule failure (e.g. invalid order transition) |
| 429  | Throttled         | Rate limit hit                                        |
| 500  | Internal          | Unhandled — never expose stack trace                  |

---

## Generating types for the client

Don't hand-type the response shapes twice. Phase 2 introduces a `client/src/types/api.ts` file that mirrors this contract; keep it in sync **manually** for v1 (it's small enough). If the API surface grows, switch to `openapi-typescript` against a Nest-generated OpenAPI spec — but defer that work; not worth the build complexity right now.
