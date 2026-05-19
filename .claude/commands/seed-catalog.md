---
description: Seed the local Postgres with the ArgosC demo catalog — categories, products, variants, stores, and a couple of test users. Idempotent; safe to re-run.
---

You are running `/seed-catalog` against the local dev database.

## Step 1 — Sanity checks

1. Confirm `docker-compose ps` shows `postgres` running. If not, ask the user before starting it.
2. Confirm `server/.env` exists and `DATABASE_URL` points at the local DB (not production).
3. If the env points anywhere ending in `.amazonaws.com`, `.supabase.co`, or production-looking hosts → **stop and ask**.

## Step 2 — Run migrations

```
cd server
npm run migration:run
```

Report the migrations applied.

## Step 3 — Run seeders

```
cd server
npm run seed:run
```

Seeders live in `server/src/database/seeders/`. They are idempotent — each seeder upserts by a natural key (slug, sku, email) so re-running is safe.

## Step 4 — Verify

Run a quick sanity SELECT (read-only) via the Bash tool:

- Count rows in `categories`, `products`, `product_variants`, `users`.
- Confirm the demo customer `customer@example.com` exists.
- Confirm the demo admin `admin@example.com` exists.

## Step 5 — Report

```
Categories: N
Products: N
Variants: N
Stores: N
Users: N (customer: ✅, admin: ✅)
```

If any count is zero where it should not be, list the seeder file that should have populated it and suggest re-running with `--force` if your seeder supports it.

Do not modify any seeder files in this command — that is a separate task.
