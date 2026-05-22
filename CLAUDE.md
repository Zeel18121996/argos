# ArgosC — Claude Code Instructions

A full-stack, pixel-perfect Argos UK e-commerce clone built with Claude Code.

- **Client**: React 19 + TypeScript (strict) + Vite + TailwindCSS 4 (in `client/`)
- **Server**: NestJS 10 + TypeScript + Sequelize 6 + PostgreSQL 16 + Redis 7 (in `server/`)
- **Architecture reference**: [`Architecture.md`](./Architecture.md)
- **Payments reference**: [`PAYMENTS.md`](./PAYMENTS.md)
- **Live reference**: https://www.argos.co.uk/

> Read [`Architecture.md`](./Architecture.md) whenever you need structural context (file locations, table columns, route paths, etc.).

---

## Locked Scope Decisions

These are settled — do not relitigate them inside a PR:

- **Simulated payments only** (no Stripe). Test card `4000000000000002` always fails; all others succeed. See [`PAYMENTS.md`](./PAYMENTS.md).
- **Local `server/uploads/`** for images via Multer + sharp. No S3/MinIO.
- **Customer storefront** depth is prioritised over admin features.
- **Admin panel** is lean: products, orders, customers, categories.
- **Store finder** is a static table — no map integration.

---

## Repo Layout

```
ArgosC/
├── client/                 # React frontend (independent package)
├── server/                 # NestJS backend (independent package)
├── docs/                   # Acceleration / vibe-coding artefacts
├── .claude/
│   ├── agents/             # Custom subagents (payment-tester, ui-pixel-reviewer, …)
│   ├── skills/             # Custom skills (nestjs-module-scaffold, …)
│   ├── commands/           # Slash commands (/build-feature, /review-pr, …)
│   └── settings.json       # Hooks + permissions
├── Architecture.md
├── PAYMENTS.md
└── docker-compose.yml
```

**Not a monorepo with shared packages.** `client/` and `server/` each have their own `node_modules` and `package.json`. Never import server code from client (or vice versa).

---

## Claude Code Workflow

When working in this repo, prefer these tools in this order:

1. **Slash commands** (`.claude/commands/`) for repeated multi-step workflows — e.g. `/build-feature`, `/review-pr`, `/check-payment-flow`.
2. **Subagents** (`.claude/agents/`) for specialist passes — spawn `payment-tester` before touching checkout, `ui-pixel-reviewer` after building any storefront page, `access-control-auditor` after admin/auth changes.
3. **Skills** (`.claude/skills/`) auto-trigger when their description matches the request — they scaffold modules, feature slices, RTK Query endpoints, and migrations following project conventions.

Read [`client/CLAUDE.md`](./client/CLAUDE.md) before frontend work and [`server/CLAUDE.md`](./server/CLAUDE.md) before backend work.

---

## Global Rules

- **TypeScript only.** No `.js` files in `client/src/` or `server/src/`. Strict mode on both sides.
- All code must pass ESLint + Prettier before commit (husky is wired up).
- Never commit secrets. Use `.env` (gitignored) and `.env.example` for documentation.
- Monetary values are **integers in pence (GBP)** internally. Convert to `£X.XX` only at the display layer.
- Dates/times are **ISO 8601 UTC** strings on the wire, native `Date` only at boundaries.

---

## Naming Conventions

| Surface               | Convention                 | Example                   |
| --------------------- | -------------------------- | ------------------------- |
| Files                 | kebab-case                 | `product-card.tsx`        |
| React components      | PascalCase                 | `ProductCard`             |
| Classes (Nest)        | PascalCase + suffix        | `ProductsController`      |
| Variables / functions | camelCase                  | `formatPrice`             |
| Constants / env keys  | SCREAMING_SNAKE_CASE       | `JWT_ACCESS_SECRET`       |
| DB columns            | snake_case                 | `is_active`, `user_id`    |
| API routes            | kebab-case plural          | `/api/v1/inventory-items` |
| Redux slices          | camelCase + `Slice` suffix | `basketSlice`             |
| RTK Query files       | camelCase + `Api` suffix   | `productsApi.ts`          |

---

## Build Phases (Status Map)

| #   | Phase                                  | Status      |
| --- | -------------------------------------- | ----------- |
| 1   | Foundation & Design System             | Done        |
| 2   | Core Layout (Header/Footer)            | Done        |
| 3   | Homepage                               | Done        |
| 4   | Category Browse & Search               | Done        |
| 5   | Product Detail Page                    | Done        |
| 6   | Auth (Register / Login)                | Done        |
| 7   | Basket / Trolley                       | Done        |
| 8   | Checkout & Payments                    | Done        |
| 9   | Account Pages                          | In progress |
| 10  | Supplementary (Tracking, Stores, Help) | Pending     |
| 11  | Polish & QA (a11y, Lighthouse)         | Pending     |

---

## Shared Conventions

### Git / Branching

- Main branch: `main` (production-ready)
- Development: `develop`
- Feature: `feature/{short-description}`
- Bug fix: `fix/{short-description}`
- Conventional Commits: `feat(basket): add item merge on user login`

### Testing

- **Client**: Vitest + React Testing Library + MSW. Co-locate `{Component}.test.tsx`.
- **Server**: Jest + Supertest. Service unit specs + controller e2e.
- Target ≥70% coverage on business logic.

### Environment

- Local dev runs via Docker Compose: `docker-compose up`.
- Client hot-reload on port `3000`, server on port `4000`.

---

## Notes for AI-Assisted Development (Claude Code)

> Always read this section before generating or editing code in this project.

- The project is NOT a monorepo with shared packages. `client/` and `server/` are independent.
- **Never** call Stripe or any real payment SDK — checkout uses the simulated processor in `server/src/payments/`.
- **Never** introduce S3/MinIO clients — uploads live on disk under `server/uploads/` and are served at `/static/uploads/`.
- All Sequelize models use **UUID primary keys**. Never auto-increment integers.
- All monetary columns are `DataType.INTEGER` (pence). Never `DECIMAL`/`FLOAT`.
- Soft delete via `isActive: false`. Never `.destroy()` products, categories, users, or orders.
- All env vars are accessed via `ConfigService` — never `process.env` directly inside controllers/services.
- Public routes use `@Public()` (from `common/decorators/public.decorator.ts`). The global `JwtAuthGuard` stays on.
- RTK Query is the only client-side data-fetching layer. Never use raw `fetch` or `axios`.
- Forms: React Hook Form + Zod via `@hookform/resolvers/zod`. Never hand-roll validation.
- All route paths come from `client/src/router/paths.ts` — never hardcode URL strings in components.
