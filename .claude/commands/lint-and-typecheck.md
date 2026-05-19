---
description: Run ESLint and TypeScript across both client/ and server/. Reports a clean pass/fail with the first 20 offending lines per package.
---

You are running `/lint-and-typecheck` for the ArgosC repo.

## Step 1 — Run in parallel

Issue both commands at once (run in background if either is slow):

- `cd client && npm run lint && npm run typecheck`
- `cd server && npm run lint && npm run build`

## Step 2 — Summarise

For each package:

- **Pass** with no output, or
- **Fail** with a count and the first 20 problem lines (file:line: rule).

If both pass, also print:

```
ArgosC lint+types — ALL CLEAN ✅
```

## Step 3 — If failures exist

- Group failures by file.
- Suggest the smallest fix per file (no code edits unless user asks).
- Highlight any **forbidden patterns** that slipped in:
  - `any` types in client.
  - `console.log` anywhere.
  - Hex colour literals in JSX.
  - Direct `process.env` access in services/controllers.
  - `Stripe` / `paypal` / `s3` / `aws-sdk` imports.

## Step 4 — Don't commit

Even if everything passes, do not stage or commit anything. The user runs `/review-pr` for that.
