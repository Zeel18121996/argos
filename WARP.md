# ArgosC – Project Rules

## Project Overview

This is a full-stack, pixel-perfect Argos UK e-commerce clone.

- **Client**: React 19 + TypeScript (strict) + Vite 8 + TailwindCSS 4 (in `client/`)
- **Server**: NestJS 10 + TypeScript + Sequelize 6 + PostgreSQL 16 + Redis 7 (in `server/`)
- **Architecture reference**: see `Architecture.md` in the repo root
- **Live reference**: https://www.argos.co.uk/
- **Scope decisions (locked):** simulated payments (no Stripe); local `server/uploads/` for images (no S3/MinIO); customer-storefront depth prioritised; admin panel is lean (products + orders + customers + categories); store finder is a static table (no map).

---

## Skills Reference

| Skill file                       | Read when…                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `.warp/skills/design-tokens.md`  | Before writing ANY Tailwind class, colour, spacing or typography                                       |
| `.warp/skills/pixel-perfect.md`  | Before building any page or component — pixel-perfect methodology + per-page checklist                 |
| `.warp/skills/components.md`     | When implementing any shared component (props, structure, behaviour)                                   |
| `.warp/skills/frontend.md`       | Before any client-side feature work (RTK Query, Redux, routing patterns)                               |
| `.warp/skills/backend.md`        | Before any server-side feature work (NestJS module, service, controller)                               |
| `.warp/skills/database.md`       | Before creating/modifying models, migrations or seeds                                                  |
| `.warp/skills/access-control.md` | Before any auth, guard, role check, or admin/staff endpoint                                            |
| `.warp/skills/admin-panel.md`    | Before any admin UI work — DataTable, AdminFormShell, image upload patterns                            |
| `.warp/skills/api-contracts.md`  | Whenever wiring a new endpoint or RTK Query slice — single source of truth for request/response shapes |
| `.warp/skills/testing.md`        | Before writing tests on either side — Vitest+RTL+MSW (client), Jest+Supertest (server)                 |
| `.warp/skills/git-workflow.md`   | Before committing, branching, or opening a PR — Conventional Commits + branching model                 |
| `.warp/skills/qa-acceptance.md`  | Before declaring a phase done — per-phase acceptance checklist, a11y, Lighthouse, responsive           |

---

## Build Phases Overview

### Phase 1 — Foundation & Design System

Monorepo scaffold, Docker Compose, Tailwind config with Argos tokens, shadcn/ui setup, global layout shell (Header + Footer skeleton).

### Phase 2 — Core Layout (Pixel-Perfect Shell)

Fully pixel-perfect Header (top bar, main bar, search, account, basket icon), MegaMenu, Footer (all 3 sections), mobile nav drawer.

### Phase 3 — Homepage

Hero banner carousel, category quick-links grid, promotional product carousels, feature banners. Server: categories API + promotions API.

### Phase 4 — Category Browse & Search

Browse page (breadcrumb, filter bar, product grid, pagination, SEO section), Search results page, filter drawer (mobile). Server: products + search APIs with full filtering.

### Phase 5 — Product Detail Page

Image gallery + lightbox, product info panel, variant selector, add-to-trolley, delivery info, description accordion, specs table, reviews section, recommendations carousel.

### Phase 6 — Auth (Register / Login)

Register + login forms (React Hook Form + Zod), JWT auth flow, ProtectedRoute, refresh token rotation. Server: auth module.

### Phase 7 — Basket / Trolley

Guest basket (Redis), authenticated basket (Postgres), basket drawer, basket page, quantity controls, promo code, order summary. Server: basket + promotions modules.

### Phase 8 — Checkout & Payments

Multi-step checkout (delivery → payment → confirmation), **simulated card processor** (test card `4000000000000002` always fails; all others succeed), order creation, order confirmation email via MailHog. Server: checkout + orders + payments modules.

### Phase 9 — Account Pages

Account dashboard, order history, order detail with status timeline, wishlist, profile + addresses management. Server: users + orders + wishlist modules.

### Phase 10 — Supplementary Pages

Order tracking (public), **store finder (static table, no map)**, help/FAQ pages. Server: stores + help modules.

### Phase 11 — Polish & QA

Accessibility audit (WCAG AA), Lighthouse performance pass, cross-browser testing, skeleton states for every async view, error boundaries, 404 page.

---

## General Rules

- Always use **TypeScript**. No `.js` files. Strict mode enabled for both client and server.
- All code must pass ESLint and Prettier without errors before committing.
- Never commit secrets or credentials. Use `.env` files (gitignored) and `.env.example` for documentation.
- All monetary values are stored and calculated as **integers in pence (GBP)** internally. Convert to `£X.XX` only at the display layer.
- All dates and times are stored/transported as **ISO 8601 UTC strings**.

---

## Client Rules (`client/`)

### Folder & Naming Conventions

- **Components**: PascalCase filenames. One component per file. e.g. `ProductCard.tsx`
- **Pages**: PascalCase, suffix `Page`. e.g. `BrowsePage.tsx`
- **Hooks**: camelCase, prefix `use`. e.g. `useBasket.ts`
- **Utils**: camelCase. e.g. `formatPrice.ts`
- **Types/interfaces**: PascalCase, suffix `Type` for types, no suffix for interfaces. e.g. `SortByType`, `interface Product`
- **Redux slices**: camelCase, suffix `Slice`. e.g. `basketSlice.ts`
- **RTK Query API files**: camelCase, suffix `Api`. e.g. `productsApi.ts`
- **Feature folders** follow the structure: `features/{featureName}/{Component,slice,api,hooks,types}.ts`

### State Management

- Use **RTK Query** for ALL server data fetching. Do not use `useEffect` + `fetch` for API calls.
- Use **Redux slices** for client-only global state (auth user, UI state, basket snapshot).
- Keep component-local state in `useState`/`useReducer`. Lift to Redux only when truly shared.
- Do not put derived data in the store. Use `createSelector` memoized selectors.

### Styling

- Use **TailwindCSS** utility classes. Avoid inline styles.
- Use **shadcn/ui** components as the base UI library. Do not reinvent buttons, dialogs, inputs from scratch.
- Responsive-first: mobile → tablet → desktop using `sm:`, `md:`, `lg:` breakpoints.
- Argos brand colours are defined in `tailwind.config.ts` under `theme.extend.colors.argos`.

### Component Patterns

- Prefer **function components** with hooks. No class components.
- Export components as named exports, not default exports (except pages).
- Do not pass more than 5 props to a component. If exceeded, group related props into an object type.
- Use `React.memo` sparingly and only with profiling evidence.
- Loading states: always show `LoadingSkeleton` while RTK Query data is fetching.
- Error states: use the shared `<ErrorBoundary>` and `<ApiError>` components.

### Routing

- All routes are defined in `client/src/router/index.tsx`.
- Protected routes wrap with `<ProtectedRoute>` HOC.
- Lazy-load all page components with `React.lazy` + `<Suspense>`.

---

## Server Rules (`server/`)

### Module Structure

Each NestJS module (`server/src/{module}/`) must contain:

```
{module}/
  {module}.module.ts
  {module}.controller.ts
  {module}.service.ts
  dto/
    create-{module}.dto.ts
    update-{module}.dto.ts
    {query-name}.dto.ts
  entities/
    {entity}.entity.ts
  interfaces/
    {name}.interface.ts   (optional)
```

### Naming Conventions

- **Controllers**: PascalCase, suffix `Controller`. e.g. `ProductsController`
- **Services**: PascalCase, suffix `Service`. e.g. `ProductsService`
- **DTOs**: PascalCase, suffix `Dto`. e.g. `CreateProductDto`
- **Entities**: PascalCase, suffix `Entity`. e.g. `ProductEntity`
- **Guards**: PascalCase, suffix `Guard`. e.g. `JwtAuthGuard`
- **Decorators**: camelCase. e.g. `@currentUser()`
- All entity table names use snake_case plural. e.g. `product_variants`

### API Design

- All routes are prefixed with `/api/v1/`.
- Use HTTP verbs correctly: `GET` read, `POST` create, `PATCH` partial update, `PUT` full replace, `DELETE` remove.
- Always use class-validator + class-transformer for DTO validation via the global `ValidationPipe`.
- All list endpoints must support `page` and `limit` query params (default: `page=1`, `limit=30`, max: `limit=100`).
- Return consistent response shapes: use the `ResponseWrapper<T>` interceptor from `common/`.
- Error handling: throw NestJS `HttpException` subclasses, never raw `Error`.

### Security

- All mutating endpoints (POST/PATCH/PUT/DELETE) require `JwtAuthGuard` unless explicitly public.
- Admin-only endpoints additionally require `RolesGuard` with `@Roles('admin')` decorator.
- Never expose password hashes or internal IDs in responses. Use DTOs with class-transformer `@Exclude()`.
- Rate-limit auth endpoints: `POST /auth/login` and `POST /auth/register` are protected by `ThrottlerGuard`.

### Database / Sequelize

- ORM: **sequelize + sequelize-typescript + @nestjs/sequelize**. Migration tool: **sequelize-cli**.
- All models extend `BaseModel` from `src/database/base.model.ts`.
- Register models per-feature with `SequelizeModule.forFeature([Model])`.
- `synchronize: true` only in development. Production always uses `npm run migration:run`.
- Migrations in `server/src/database/migrations/` (plain `.js` files generated by sequelize-cli).
- Seeds in `server/src/database/seeders/`. Run with `npm run seed:run`.
- All monetary columns are `DataType.INTEGER` (pence). Never DECIMAL/FLOAT for money.
- Never call `.destroy()` on products/categories/users/orders — use soft-delete (`isActive: false`).

---

## Shared Conventions

### Git / Branching

- Main branch: `main` (production-ready)
- Development branch: `develop`
- Feature branches: `feature/{short-description}`
- Bug fix branches: `fix/{short-description}`
- Branch off `develop`, PR back to `develop`, merge to `main` via release branch.

### Commit Messages

- Follow Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Example: `feat(basket): add item merge on user login`

### Testing

- Client: **Vitest** + **React Testing Library**. Unit test hooks and utils; integration test key user flows.
- Server: **Jest** + NestJS testing utilities. Unit test services; e2e test controllers.
- Aim for ≥70% coverage on business logic (services, hooks, utils).
- Test files co-located: `{module}.service.spec.ts`, `{Component}.test.tsx`

### Environment

- Local dev runs entirely via **Docker Compose**.
- Use `docker-compose up` to start all services.
- Client hot-reload on port `3000`, server on port `4000`.
