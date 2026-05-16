# ArgosC – Client Rules (React Frontend)

> These rules apply when working inside `client/`. They extend and take precedence over the root `WARP.md`.

---

## Skill Reference

Before implementing any frontend feature, read `.warp/skills/frontend.md`.
Before implementing any guard, protected route, or admin/staff UI, read `.warp/skills/access-control.md`.
Before styling any component, read `.warp/skills/design-tokens.md` and `.warp/skills/pixel-perfect.md`.

---

## Project Setup

- **Build tool**: Vite 5 (`vite.config.ts`)
- **Entry point**: `src/main.tsx` → mounts `<App />` wrapped in `<Provider store={store}>` and `<BrowserRouter>`
- **Alias**: `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`)
- **Tests**: run with `npm run test` (Vitest)
- **Lint**: run with `npm run lint` (ESLint + `eslint-plugin-react-hooks` + `eslint-plugin-import`)
- **Type check**: run with `npm run typecheck` (tsc --noEmit)

---

## Folder Rules

### `src/components/`

- Only **truly shared** components live here (used by 3+ features or pages).
- Sub-folders: `common/` (generic UI), `layout/` (Header, Footer, MegaMenu, Breadcrumb), `product/` (ProductCard, ProductGrid, RatingStars, PriceDisplay).
- No API calls inside `components/`. Pass data via props or let the parent page fetch.

### `src/features/`

- Feature folders are **self-contained**: each has its own slice, RTK Query endpoints, components, and hooks.
- Feature components are **not** re-exported from `src/components/` — import directly from the feature.
- Feature-local components that are only used inside that feature stay inside the feature folder.

### `src/pages/`

- Page components are **thin orchestrators**: they fetch data via RTK Query hooks and pass it down to feature/shared components.
- Pages do **not** contain inline business logic or complex JSX — extract into feature components.
- All page components are default exports (required for `React.lazy`).

### `src/services/`

- One file per API resource: `productsApi.ts`, `categoriesApi.ts`, `basketApi.ts`, etc.
- All use `baseApi.injectEndpoints(...)` — never create a second `createApi()` call.

### `src/types/`

- Interfaces and types that are shared across multiple features live here.
- Feature-specific types stay co-located inside the feature folder.

---

## Component Rules

### Do ✅

- Use named exports for all components **except** page components.
- Keep components under **150 lines**. Split into sub-components if larger.
- Use `data-testid` attributes on interactive elements for testing.
- Use `aria-*` attributes and semantic HTML for accessibility.
- Use optional chaining (`?.`) and nullish coalescing (`??`) — never assume API data is defined.

### Don't ❌

- Don't use `any` type. Use `unknown` and narrow it, or define a proper interface.
- Don't use `index` as a list `key`. Always use stable IDs.
- Don't import from `../../../` more than 2 levels deep — use the `@/` alias instead.
- Don't access `window`, `document`, or `localStorage` directly in components — wrap in a custom hook.
- Don't put `console.log` in committed code.

---

## State Rules

### Redux slices (`src/features/*/slice.ts`)

Slice state shape convention:

```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
```

- Status field must use the 4-value union `'idle' | 'loading' | 'succeeded' | 'failed'`.
- `error` field is always `string | null`.

### RTK Query cache tags

Use granular tags to avoid over-invalidation:

```typescript
// Good – invalidates only the specific product
invalidatesTags: [{ type: 'Product', id }]

// Bad – invalidates ALL products on every mutation
invalidatesTags: ['Product']
```

Exception: use the broad tag only for create/delete mutations where the list must be refreshed.

---

## Styling Rules

### TailwindCSS

- Use `cn()` utility (`import { cn } from '@/utils/cn'`) for conditional class merging — never string concatenation.
- Extract repeated Tailwind class combinations into a local `const styles = { ... }` object at the top of the file when used more than twice.
- Dark mode is **not** in scope for Phase 1 — do not add `dark:` variants.

### shadcn/ui

- Import shadcn components from `@/components/ui/` (the shadcn output directory).
- Do not modify files inside `@/components/ui/` directly — extend by wrapping them.
- Use shadcn's `<Button>`, `<Dialog>`, `<Sheet>`, `<Input>`, `<Select>`, `<Skeleton>` as the base for all UI.

---

## Forms

- Use **React Hook Form** (`react-hook-form`) for all forms.
- Use **Zod** for schema validation, connected via `@hookform/resolvers/zod`.
- Never build custom form validation logic by hand.

```typescript
// Standard form pattern
const schema = z.object({ email: z.string().email(), password: z.string().min(8) })
type FormValues = z.infer<typeof schema>

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<FormValues>({
  resolver: zodResolver(schema),
})
```

---

## Testing

- Test file location: co-located, e.g. `ProductCard.test.tsx` next to `ProductCard.tsx`.
- Test naming: `describe('ProductCard', () => { it('renders product name', ...) })`.
- Always test: loading state, error state, and happy path.
- Mock RTK Query with `msw` (Mock Service Worker) — do not mock the Redux store directly.
- Do **not** test implementation details (internal state, private functions). Test behaviour.

---

## Performance Checklist (before PR)

- [ ] All page components are lazy-loaded (`React.lazy`).
- [ ] Images use `loading="lazy"` and explicit `width`/`height`.
- [ ] Lists with 50+ items use virtualisation (`react-virtual` or `@tanstack/react-virtual`).
- [ ] No unnecessary re-renders — check with React DevTools Profiler if a page feels slow.

---

## Access Control Rules

Roles: `customer` | `staff` | `admin`. Read `.warp/skills/access-control.md` for the full spec.

### Route guards — which to use

| Situation                                             | Guard component                             |
| ----------------------------------------------------- | ------------------------------------------- |
| Customer account pages (`/account/*`)                 | `<ProtectedRoute>`                          |
| Admin/staff pages (`/admin/*`)                        | `<StaffRoute>`                              |
| Admin-only pages (`/admin/users`, `/admin/audit-log`) | `<AdminRoute>` nested inside `<StaffRoute>` |
| Checkout                                              | `<ProtectedRoute>`                          |

### Admin UI folder structure

```
client/src/
├── admin/
│   ├── AdminLayout.tsx       ← sidebar + topbar, no header/footer
│   ├── pages/
│   │   ├── AdminDashboardPage.tsx
│   │   ├── AdminProductsPage.tsx
│   │   ├── AdminProductFormPage.tsx
│   │   ├── AdminCategoriesPage.tsx
│   │   ├── AdminOrdersPage.tsx
│   │   ├── AdminOrderDetailPage.tsx
│   │   ├── AdminPromotionsPage.tsx
│   │   ├── AdminReviewsPage.tsx
│   │   ├── AdminStoresPage.tsx
│   │   ├── AdminUsersPage.tsx       ← admin only
│   │   └── AdminAuditLogPage.tsx    ← admin only
│   └── features/
│       ├── products/
│       ├── orders/
│       └── users/
```

### Rules

- Admin pages use `AdminLayout` (sidebar nav), NOT the customer `Header`/`Footer`.
- The `AdminSidebar` shows the "System" section (Users, Audit Log) only when `isAdmin === true`.
- Use `useAuth().isStaff` / `useAuth().isAdmin` for conditional UI rendering.
- Never conditionally render a UI element as the ONLY access control — always back it with a route guard AND a server-side `@Roles()` guard.
- Admin pages use the same RTK Query `baseApi` but call `/api/v1/admin/*` endpoints.
- Admin forms use the same React Hook Form + Zod pattern as customer forms.
