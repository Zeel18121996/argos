# Skill: Argos Clone — Admin Panel UI

## When to use this skill

Read this before implementing any admin-side page or component in `client/src/admin/`. Read `access-control.md` first for the role/permission model.

---

## Scope (v1 — lean)

Admin v1 ships only these areas. Anything outside this list is deferred to a future phase.

| Section      | Page                                         | Backend endpoint              |
| ------------ | -------------------------------------------- | ----------------------------- |
| Dashboard    | `AdminDashboardPage`                         | `GET /admin/dashboard/stats`  |
| Catalogue    | `AdminProductsPage` + `AdminProductFormPage` | `/products` (admin scope)     |
| Catalogue    | `AdminCategoriesPage`                        | `/categories` (admin scope)   |
| Orders       | `AdminOrdersPage` + `AdminOrderDetailPage`   | `/orders` (admin scope)       |
| People       | `AdminCustomersPage` (+ detail drawer)       | `/admin/users`                |
| (admin only) | `AdminRolesAction` inline in CustomersPage   | `PATCH /admin/users/:id/role` |

**Out of scope for v1:** drag-to-reorder categories, rich charts (recharts/visx), audit-log page, low-stock alerts, top-products widget, promotions UI (Phase 6), reviews moderation UI (Phase 6), bulk CSV import/export. Don't build them.

---

## Folder Layout

```
client/src/admin/
├── AdminLayout.tsx          # sidebar + topbar + <Outlet/>
├── AdminSidebar.tsx
├── AdminTopBar.tsx          # account dropdown, env badge, logout
├── components/
│   ├── DataTable.tsx        # generic sortable/paginated table
│   ├── DataTableToolbar.tsx # search input + filter chips + bulk actions
│   ├── AdminFormShell.tsx   # header + sticky actions + dirty tracking
│   ├── StatusPill.tsx       # order status, user status
│   ├── ImageUploader.tsx    # drag-drop, preview grid, reorder
│   ├── ConfirmDialog.tsx
│   └── EmptyState.tsx
├── pages/
│   ├── dashboard/
│   ├── products/
│   ├── categories/
│   ├── orders/
│   └── customers/
└── hooks/
    ├── useDataTable.ts      # sort/page/filter state in URL search params
    └── useDirtyForm.ts      # warn on unsaved changes
```

Route registration lives in `client/src/router/index.tsx` under `/admin`, wrapped by `<StaffRoute>` (admin-only sub-routes additionally wrapped by `<AdminRoute>`). See `access-control.md`.

---

## AdminLayout

```tsx
// client/src/admin/AdminLayout.tsx
import { Outlet, NavLink } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopBar } from './AdminTopBar'

export function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-argos-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar />
        <main className="flex-1 p-6 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

- Sidebar: fixed `w-60` on desktop, hamburger-toggled drawer below `lg`.
- TopBar: sticky `h-14`, shows current user, env badge (`DEV`/`STAGING`), logout.
- The admin UI uses a **separate aesthetic** from the customer storefront: denser, more table-driven, monochrome with `argos-red` reserved for destructive actions only.

---

## DataTable Pattern

A single generic `<DataTable<T>>` covers every list page. URL search params hold sort/page/filters so refreshing the page restores state and admins can share links.

### Props

```tsx
interface Column<T> {
  key: string // unique per column
  header: string | React.ReactNode
  accessor: (row: T) => React.ReactNode
  sortable?: boolean // backend must support this key
  width?: string // e.g. '120px', '20%'
  align?: 'left' | 'right' | 'center'
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  isLoading?: boolean
  pagination: { page: number; totalPages: number; total: number; limit: number }
  sort?: { key: string; direction: 'asc' | 'desc' }
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void
  onPageChange: (page: number) => void
  onRowClick?: (row: T) => void // navigate to detail page
  rowActions?: (row: T) => React.ReactNode // ⋯ menu, edit, delete
  emptyState?: React.ReactNode
  selectable?: boolean // adds checkbox column + bulk actions slot
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
}
```

### Behaviour

- Loading: render 10 skeleton rows (`<TableSkeletonRow>` shimmer) — never a spinner.
- Empty: `<EmptyState icon="Inbox" title="No products yet" cta={<Button to="new">Add product</Button>} />`
- Row click navigates to `/{section}/{id}`; clicks on the row-action cell don't bubble.
- Sort header: arrow indicator, clickable only if `sortable`. Server-driven sort — the table never sorts client-side.
- Pagination: `<` 1 2 3 … 12 `>` — same component as the customer-side `Pagination` (keep visual style consistent inside admin: smaller, `h-8` buttons).
- URL state shape: `?page=2&sort=created_at&dir=desc&q=ipad&brand=apple&status=processing`.

### Example: `AdminProductsPage`

```tsx
const [searchParams, setSearchParams] = useSearchParams();
const params = useDataTable<ProductListParams>({ defaultLimit: 25 });
const { data, isLoading } = useGetAdminProductsQuery(params.value);

return (
  <AdminFormShell title="Products" actions={<Link to="new" className="btn-primary">+ Add product</Link>}>
    <DataTableToolbar
      search={params.value.q}
      onSearchChange={(q) => params.set({ q, page: 1 })}
      filters={[
        { label: 'Brand', value: params.value.brand, options: brandOptions, onChange: ... },
        { label: 'Status', value: params.value.status, options: ['active','inactive'], onChange: ... },
      ]}
    />
    <DataTable
      data={data?.data ?? []}
      columns={productColumns}
      rowKey={(p) => p.id}
      isLoading={isLoading}
      pagination={data?.meta ?? defaultMeta}
      sort={{ key: params.value.sortBy ?? 'createdAt', direction: params.value.dir ?? 'desc' }}
      onSortChange={(key, dir) => params.set({ sortBy: key, dir, page: 1 })}
      onPageChange={(p) => params.set({ page: p })}
      onRowClick={(p) => navigate(`${p.id}/edit`)}
      rowActions={(p) => <ProductRowActions product={p} />}
    />
  </AdminFormShell>
);
```

---

## AdminFormShell

```tsx
interface AdminFormShellProps {
  title: string
  subtitle?: string
  backHref?: string // optional ← arrow
  actions?: React.ReactNode // right-aligned in header
  stickyFooter?: React.ReactNode // save/cancel sticky bottom
  isDirty?: boolean // shows "Unsaved changes" pill
  isSaving?: boolean
  children: React.ReactNode
}
```

- Header: title + subtitle + actions, `border-b`.
- Body: max-width `1200px`, two-column form layout on `lg+` (main fields left, side panel right for status/category/visibility).
- Sticky footer: `Cancel` (ghost) | `Save` (primary). Save shows spinner while `isSaving`; disabled while pristine.
- `useDirtyForm(formState)` hook attaches `beforeunload` and React Router blocker.
- Validation: React Hook Form + Yup. Field errors render inline below input; first-error scrolls into view on submit.

---

## ImageUploader

For `AdminProductFormPage`. Backed by `POST /admin/products/:id/images` (multipart). Server returns the inserted `ProductImage[]` after sharp resizing.

```tsx
interface ImageUploaderProps {
  productId: string // upload requires an existing draft
  images: ProductImage[] // current images
  onChange: (images: ProductImage[]) => void
  maxFiles?: number // default 8
  maxSizeMB?: number // default 5
}
```

### Behaviour

- Drop-zone area with `Drop images here, or click to browse`
- Validates client-side: `image/jpeg`, `image/png`, `image/webp`; rejects > 5 MB
- Uploads sequentially with progress bar per file
- Grid of thumbnails: each shows `[ ⋯ remove ] [ ⤺ make primary ]`
- Re-order by drag (use `@dnd-kit/sortable`) — emits `PATCH /products/:id/images/order { ids: [...] }`
- Primary image = `sort_order = 0`. The card grid on the customer site reads the first image.

---

## StatusPill

Single component for order status, user status, product visibility. Maps statuses to colours from the Argos token palette.

```tsx
type StatusKey =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'active'
  | 'inactive'
  | 'deactivated'
  | 'paid'
  | 'failed'

const STATUS_STYLE: Record<StatusKey, string> = {
  pending: 'bg-argos-yellow text-argos-yellow-text',
  confirmed: 'bg-argos-blue-light text-argos-blue',
  processing: 'bg-argos-blue-light text-argos-blue',
  shipped: 'bg-argos-blue text-white',
  delivered: 'bg-argos-green-light text-argos-green',
  cancelled: 'bg-argos-gray-200 text-argos-gray-700',
  refunded: 'bg-argos-gray-200 text-argos-gray-700',
  active: 'bg-argos-green-light text-argos-green',
  inactive: 'bg-argos-gray-200 text-argos-gray-600',
  deactivated: 'bg-argos-red-light text-argos-red',
  paid: 'bg-argos-green-light text-argos-green',
  failed: 'bg-argos-red-light text-argos-red',
}
```

Usage: `<StatusPill status={order.status} />`. Always lowercase keys; server returns lowercase; never style by string comparison anywhere else.

---

## Order Detail (admin)

`AdminOrderDetailPage` layout (2-col):

- Left (wider): order items table, customer block (link to customer drawer), delivery address, payment summary, internal notes textarea (admin only).
- Right (sticky): status timeline + transition buttons (Confirm → Process → Ship → Deliver → Cancel/Refund), each behind `ConfirmDialog`.

Status transitions are server-driven: `PATCH /orders/:id/status { next: 'shipped', trackingNumber?: '...' }`. The UI never decides the next valid status; the server returns 400 with `errors: [{ field: 'next', message: '...' }]` for invalid transitions.

---

## Customer Detail Drawer

Side drawer slides in from the right when a row is clicked on `AdminCustomersPage` (don't navigate to a separate page — the table context is preserved).

Contents:

- Identity (name, email, role badge, status pill)
- Order history (last 10 with link to admin order detail)
- Addresses (read-only)
- Actions: `Deactivate` (toggle), and — admin only — `Change role` dropdown (customer/staff/admin) with `ConfirmDialog`.

Closing the drawer leaves `?customer=<id>` in the URL so refresh / share link works.

---

## Optimistic Mutations (admin)

RTK Query mutations use `onQueryStarted` to optimistically update the cache so the DataTable feels instant. On error, roll back and toast.

```ts
toggleStatus: builder.mutation<User, { id: string; isActive: boolean }>({
  query: ({ id, isActive }) => ({ url: `/admin/users/${id}/status`, method: 'PATCH', body: { isActive } }),
  async onQueryStarted({ id, isActive }, { dispatch, queryFulfilled }) {
    const patches = dispatch(adminApi.util.updateQueryData('getAdminUsers', undefined,
      (draft) => { const u = draft.data.find(u => u.id === id); if (u) u.isActive = isActive; }
    ));
    try { await queryFulfilled; } catch { patches.undo(); toast.error('Could not update'); }
  },
  invalidatesTags: ['User'],
}),
```

---

## Common Pitfalls

- **Don't write a client-side sort.** Always send `sortBy` + `dir` to the server, even when the dataset is small — it keeps URL state and server pagination consistent.
- **Don't paginate client-side either.** The server holds the truth; the table renders exactly what comes back.
- **Don't gate UI exclusively on `useAuth().isAdmin`** — the server's `RolesGuard` is the real check. UI gating is a UX hint, not security.
- **Don't add charts in v1.** Stat cards are plain numbers + small trend arrow (↑ / ↓) — no chart library.
- **Don't use a separate admin colour palette.** Reuse the customer-side tokens from `design-tokens.md`; admin gets the same `argos-*` colours but in a denser layout.
