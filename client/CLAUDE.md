# ArgosC — Client (React Frontend) Claude Instructions

> Rules for work inside `client/`. Extends and overrides the root [`CLAUDE.md`](../CLAUDE.md).

---

## Project Setup

- **Build tool**: Vite (`vite.config.ts`)
- **Entry point**: `src/main.tsx` → mounts `<App />` wrapped in `<Provider store={store}>` and `<BrowserRouter>`
- **Path alias**: `@/` → `src/` (configured in `vite.config.ts` and `tsconfig.json`)
- **Tests**: `npm run test` (Vitest)
- **Lint**: `npm run lint` (ESLint + `eslint-plugin-react-hooks` + `eslint-plugin-import`)
- **Type check**: `npm run typecheck` (tsc --noEmit)

---

## Folder Rules

### `src/components/`

- Only **truly shared** components live here (used by 3+ features or pages).
- Sub-folders: `common/`, `layout/`, `product/`.
- **No API calls** inside `components/`. Pass data via props.

### `src/features/`

- Feature folders are **self-contained**: each has its slice, RTK Query endpoints, components, and hooks.
- Feature components are not re-exported from `src/components/` — import directly from the feature.

### `src/pages/`

- Page components are **thin orchestrators**: fetch via RTK Query hooks, pass down to feature/shared components.
- No inline business logic — extract into feature components.
- All pages use **default exports** (required for `React.lazy`).

### `src/services/`

- One file per API resource: `productsApi.ts`, `categoriesApi.ts`, `basketApi.ts`, etc.
- Always use `baseApi.injectEndpoints(...)` — never create a second `createApi()`.

### `src/types/`

- Cross-feature interfaces/types live here. Feature-specific types stay co-located.

---

## Component Rules

### Do

- Named exports for all components **except** pages.
- Components under **150 lines** — split into sub-components if larger.
- `data-testid` on interactive elements.
- Semantic HTML + `aria-*` attributes.
- Optional chaining (`?.`) and nullish coalescing (`??`) — never assume API data is defined.

### Don't

- No `any`. Use `unknown` + narrowing, or define an interface.
- No `index` as list `key` — always stable IDs.
- No `../../../` deeper than 2 levels — use `@/`.
- No direct `window`/`document`/`localStorage` access in components — wrap in a hook.
- No `console.log` in committed code.

---

## State Management

### RTK Query (`src/services/`)

- All **server data** fetching. No `useEffect` + `fetch`.
- Use granular cache tags:

```typescript
// Good — invalidates only this product
invalidatesTags: [{ type: 'Product', id }]

// Bad — invalidates ALL products on every mutation
invalidatesTags: ['Product']
```

Use the broad tag only for create/delete where the list must refresh.

### Redux Slices (`src/features/*/slice.ts`)

- Client-only global state (auth, UI state, basket snapshot).
- Standard async-status shape:

```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
```

- `status` is always that 4-value union; `error` is `string | null`.
- Use `createSelector` for derived data — never store it.

### Local State

- Keep in `useState`/`useReducer`. Lift to Redux only when truly shared.

---

## Styling

### TailwindCSS

- Use `cn()` from `@/utils/cn` for conditional class merging — never string concatenation.
- Extract repeated class combinations into a local `const styles = { … }` when used 3+ times.
- Dark mode is out of scope — do not add `dark:` variants.
- Argos brand tokens live in `tailwind.config.ts` under `theme.extend.colors.argos`.

### shadcn/ui

- Import from `@/components/ui/`.
- **Do not modify** files inside `@/components/ui/` directly — extend by wrapping.
- Use `<Button>`, `<Dialog>`, `<Sheet>`, `<Input>`, `<Select>`, `<Skeleton>` as base UI.

---

## Forms

- **React Hook Form** + **Zod** via `@hookform/resolvers/zod`. No hand-rolled validation.

```typescript
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

## Routing

- Routes defined in `client/src/router/index.tsx`.
- Path constants in `client/src/router/paths.ts` — never hardcode URLs.
- Protect with `<ProtectedRoute>` / `<StaffRoute>` / `<AdminRoute>` HOCs.
- Lazy-load all pages with `React.lazy` + `<Suspense>`.

---

## Access Control

Roles: `customer` | `staff` | `admin`.

| Situation                                       | Guard component                         |
| ----------------------------------------------- | --------------------------------------- |
| Customer account (`/account/*`)                 | `<ProtectedRoute>`                      |
| Admin/staff (`/admin/*`)                        | `<StaffRoute>`                          |
| Admin-only (`/admin/users`, `/admin/audit-log`) | `<AdminRoute>` nested in `<StaffRoute>` |
| Checkout                                        | `<ProtectedRoute>`                      |

- Admin pages use `AdminLayout` (sidebar nav) — NOT the customer `Header`/`Footer`.
- Conditional UI via `useAuth().isStaff` / `useAuth().isAdmin`.
- Never let UI conditional rendering be the only access control — always pair with a route guard **and** server-side `@Roles()`.

---

## Testing

- Co-locate: `ProductCard.test.tsx` next to `ProductCard.tsx`.
- Always test: loading state, error state, happy path.
- Mock with **MSW** — never mock the Redux store directly.
- Test **behaviour**, not implementation details.

---

## Performance Checklist (before PR)

- [ ] All pages lazy-loaded (`React.lazy`).
- [ ] Images use `loading="lazy"` + explicit `width`/`height`.
- [ ] Lists with 50+ items virtualised (`@tanstack/react-virtual`).
- [ ] No needless re-renders (React DevTools Profiler).

---

## When to invoke Claude tools

- Pixel-matching a storefront page → spawn the [`ui-pixel-reviewer`](../.claude/agents/ui-pixel-reviewer.md) subagent.
- Adding a new client feature → trigger the `react-feature-slice` skill.
- Adding an API call → trigger the `rtk-query-endpoint` skill.
- Pre-PR sweep → run `/lint-and-typecheck` and `/review-pr`.
