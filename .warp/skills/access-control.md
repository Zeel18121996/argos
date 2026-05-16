# Skill: Access Control (RBAC — Option A: Pure Argos Replica)

## When to use this skill

Read this before implementing any guard, route protection, permission check, or admin/staff feature.

---

## Role Definitions

| Role       | Who                         | Description                                                                                                               |
| ---------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `customer` | Public / registered shopper | Default role on registration. Can browse, purchase, review, manage own account.                                           |
| `staff`    | Argos internal employees    | Back-office operators. Can manage products, categories, orders, promotions, reviews. Cannot manage users or change roles. |
| `admin`    | Technical / IT superuser    | Full platform access. Only admins can manage users, assign roles, and access platform config.                             |

### Role hierarchy (ascending permission)

```
customer  <  staff  <  admin
```

Admin inherits all staff capabilities. Staff inherits no customer capabilities (staff should not be buying).

---

## What Each Role Can Do

### customer

- Browse all public pages (no auth required)
- Register / login / manage own profile & addresses
- Add to basket, checkout, pay
- View own orders, track orders
- Write reviews (verified purchase only)
- Manage own wishlist
- No access to `/admin/*`

### staff

Everything customer can do PLUS:

- Access `/admin/*` dashboard
- **Products**: create, edit, deactivate products & variants; manage product images
- **Categories**: create, edit, reorder, deactivate categories
- **Orders**: view all orders, update order status, process refunds, add notes
- **Promotions**: create/edit/deactivate banners and discount codes
- **Reviews**: moderate (approve / reject / delete) all reviews
- **Stores**: manage store hours and details
- **Help**: create/edit help articles
- Cannot: view user list, change user roles, access platform config, delete users

### admin

Everything staff can do PLUS:

- **Users**: view all users, activate/deactivate accounts, change roles (customer ↔ staff)
- **Staff management**: create staff accounts
- **Platform config**: site-wide settings, maintenance mode
- **Audit log**: view all admin actions
- Only admins can promote/demote other users

---

## Database Schema

### `users` table role column

```sql
-- Role stored as VARCHAR with CHECK constraint (not enum — easier to migrate)
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'customer'
  CHECK (role IN ('customer', 'staff', 'admin'));

-- Index for fast role-based queries
CREATE INDEX idx_users_role ON users(role);
```

### TypeORM entity update

```typescript
// users/entities/user.entity.ts
export type UserRole = 'customer' | 'staff' | 'admin'

@Entity('users')
export class UserEntity extends BaseEntity {
  // ... existing fields

  @Column({ type: 'varchar', default: 'customer' })
  role: UserRole
}
```

### `admin_audit_log` table (new)

```sql
admin_audit_log
  id          UUID PK
  user_id     UUID FK → users.id
  action      VARCHAR     -- e.g. 'UPDATE_PRODUCT', 'CHANGE_USER_ROLE'
  entity_type VARCHAR     -- e.g. 'Product', 'User'
  entity_id   UUID
  before      JSONB       -- snapshot before change
  after       JSONB       -- snapshot after change
  ip_address  VARCHAR
  created_at  TIMESTAMP
```

---

## Backend: NestJS Guards

### Role guard implementation

```typescript
// common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import type { UserRole } from '../../users/entities/user.entity'

const ROLE_HIERARCHY: Record<UserRole, number> = {
  customer: 0,
  staff: 1,
  admin: 2,
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // No @Roles() decorator → any authenticated user passes
    if (!requiredRoles || requiredRoles.length === 0) return true

    const { user } = context.switchToHttp().getRequest()
    if (!user) return false

    const userLevel = ROLE_HIERARCHY[user.role as UserRole] ?? -1
    // User must meet the MINIMUM required role level
    const minRequired = Math.min(...requiredRoles.map((r) => ROLE_HIERARCHY[r]))
    return userLevel >= minRequired
  }
}
```

### Roles decorator

```typescript
// common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common'
import type { UserRole } from '../../users/entities/user.entity'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
```

### Usage pattern in controllers

```typescript
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {

  // PUBLIC — no auth needed
  @Get()
  @Public()
  findAll(@Query() query: QueryProductDto) { ... }

  // STAFF OR ABOVE
  @Post()
  @Roles('staff')   // staff + admin both pass (hierarchy-based)
  create(@Body() dto: CreateProductDto) { ... }

  // ADMIN ONLY
  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseUUIDPipe) id: string) { ... }
}
```

### Admin audit logging

```typescript
// common/decorators/audit.decorator.ts
export const Audit = (action: string, entityType: string) =>
  SetMetadata('audit', { action, entityType })

// common/interceptors/audit.interceptor.ts
// Reads @Audit() metadata, logs to admin_audit_log after successful mutation
```

---

## Backend: JWT Payload

The role is embedded in the JWT so guards don't need a DB lookup per request:

```typescript
interface JwtPayload {
  sub: string // user UUID
  email: string
  role: UserRole // 'customer' | 'staff' | 'admin'
  iat: number
  exp: number
}

// AuthService.login():
const payload: JwtPayload = {
  sub: user.id,
  email: user.email,
  role: user.role, // embedded here
}
return this.jwtService.sign(payload)
```

**Important:** When an admin changes a user's role, the user must re-login to get a new token with the updated role. Inform the user of this in the UI.

---

## Backend: Admin-Scoped Endpoints

All admin endpoints live under the `/api/v1/admin/` prefix in a dedicated `AdminModule`:

```
AdminModule
  GET  /api/v1/admin/users              @Roles('admin')
  GET  /api/v1/admin/users/:id          @Roles('admin')
  PATCH /api/v1/admin/users/:id/role    @Roles('admin')
  PATCH /api/v1/admin/users/:id/status  @Roles('admin')
  GET  /api/v1/admin/audit-log          @Roles('admin')
  GET  /api/v1/admin/dashboard/stats    @Roles('staff')
```

Staff-accessible endpoints remain in their respective modules (products, orders, etc.) but require `@Roles('staff')`.

---

## Frontend: Route Protection

### Three route guard HOCs

```typescript
// components/common/ProtectedRoute.tsx — requires any auth (customer+)
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

// components/common/StaffRoute.tsx — requires staff or admin
export function StaffRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== 'staff' && user.role !== 'admin')
    return <Navigate to="/" replace />;
  return <>{children}</>;
}

// components/common/AdminRoute.tsx — requires admin only
export function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== 'admin')
    return <Navigate to="/admin" replace />;  // redirect to admin home, not customer
  return <>{children}</>;
}
```

### Route config

```typescript
// router/index.tsx
{
  path: '/admin',
  element: <StaffRoute><AdminLayout /></StaffRoute>,
  children: [
    { index: true,              element: <AdminDashboardPage /> },
    { path: 'products',         element: <AdminProductsPage /> },
    { path: 'products/new',     element: <AdminProductFormPage /> },
    { path: 'products/:id/edit',element: <AdminProductFormPage /> },
    { path: 'categories',       element: <AdminCategoriesPage /> },
    { path: 'orders',           element: <AdminOrdersPage /> },
    { path: 'orders/:id',       element: <AdminOrderDetailPage /> },
    { path: 'promotions',       element: <AdminPromotionsPage /> },
    { path: 'reviews',          element: <AdminReviewsPage /> },
    { path: 'stores',           element: <AdminStoresPage /> },
    // Admin-only below
    {
      path: 'users',
      element: <AdminRoute><AdminUsersPage /></AdminRoute>,
    },
    {
      path: 'audit-log',
      element: <AdminRoute><AdminAuditLogPage /></AdminRoute>,
    },
  ],
},
```

---

## Frontend: Admin Layout

```
AdminLayout
├── AdminSidebar
│   ├── Logo (Argos + "Admin" badge)
│   ├── NavSection "Catalogue"
│   │     Products · Categories
│   ├── NavSection "Orders"
│   │     All Orders · Refunds
│   ├── NavSection "Marketing"
│   │     Promotions · Banners
│   ├── NavSection "Content"
│   │     Reviews · Help · Stores
│   └── NavSection "System"  ← admin only (hidden from staff)
│         Users · Audit Log
└── AdminContent (main area)
    └── <Outlet />
```

The sidebar hides "System" section when `user.role !== 'admin'` — but the route guard is the real enforcement; the hidden nav is just UX.

---

## Frontend: Auth State Shape

```typescript
// features/auth/authSlice.ts
interface AuthState {
  user: {
    id: string
    email: string
    firstName: string
    role: 'customer' | 'staff' | 'admin'
  } | null
  accessToken: string | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
```

### Role helper hooks

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const user = useSelector((s: RootState) => s.auth.user)
  return {
    user,
    isAuthenticated: !!user,
    isStaff: user?.role === 'staff' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
  }
}

// Usage:
const { isStaff, isAdmin } = useAuth()
```

---

## Security Rules (CRITICAL)

1. **Server is the source of truth.** Frontend route guards are UX only — never trust them for security. The `RolesGuard` on the server is what actually enforces access.
2. **Role is in the JWT.** Never pass role as a query param or request body — always read from `request.user` (set by `JwtStrategy`).
3. **Never expose `admin_audit_log` to `staff`** — only `admin` role.
4. **Role changes require re-authentication.** After an admin changes a user's role, the old JWT still has the old role until expiry (15 min max). Notify admin of this limitation in the UI.
5. **Rate-limit admin login separately** — admin/staff login endpoint gets stricter throttling: 3 attempts / 5 min.
6. **Admin panel has a separate login page** at `/admin/login` — same endpoint, just separate UI for clarity.

---

## Summary Table: Endpoint Access

| Endpoint group                       | customer | staff | admin |
| ------------------------------------ | :------: | :---: | :---: |
| `GET /api/v1/products` (public)      |    ✅    |  ✅   |  ✅   |
| `POST /api/v1/basket/items`          |    ✅    |  ❌   |  ❌   |
| `POST /api/v1/orders`                |    ✅    |  ❌   |  ❌   |
| `GET /api/v1/orders` (own)           |    ✅    |  ❌   |  ✅   |
| `GET /api/v1/admin/orders` (all)     |    ❌    |  ✅   |  ✅   |
| `POST /api/v1/products`              |    ❌    |  ✅   |  ✅   |
| `DELETE /api/v1/products/:id`        |    ❌    |  ❌   |  ✅   |
| `POST /api/v1/promotions`            |    ❌    |  ✅   |  ✅   |
| `GET /api/v1/admin/users`            |    ❌    |  ❌   |  ✅   |
| `PATCH /api/v1/admin/users/:id/role` |    ❌    |  ❌   |  ✅   |
| `GET /api/v1/admin/audit-log`        |    ❌    |  ❌   |  ✅   |
