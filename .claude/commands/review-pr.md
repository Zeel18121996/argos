---
description: Pre-PR review checklist for ArgosC — runs lint+types, spawns api-contract-checker, access-control-auditor, payment-tester (if checkout touched), and ui-pixel-reviewer (if client touched). Produces a single merge-readiness report.
---

You are running `/review-pr` — the final gate before opening a PR for the ArgosC repo.

## Step 1 — Scope

1. Run `git status` and `git diff --stat` to list changed files vs `develop`.
2. Categorise:
   - Server changes (`server/src/`)
   - Client changes (`client/src/`)
   - Migrations (`server/src/database/migrations/`)
   - Docs / config

Print the categorised summary.

## Step 2 — Hard gates (run in parallel)

Spawn these in one message:

- `Bash: cd client && npm run lint && npm run typecheck`
- `Bash: cd server && npm run lint && npm run build`
- `Bash: cd server && npm run test`
- `Bash: cd client && npm run test`

Any failure here blocks the PR. Surface the first 20 failing lines per package.

## Step 3 — Specialist passes (parallel, only if relevant)

Spawn subagents based on what changed:

- **Always** (if server changed): `api-contract-checker`.
- **If admin or auth touched**: `access-control-auditor`.
- **If checkout/payments touched**: `payment-tester`.
- **If client storefront pages touched**: `ui-pixel-reviewer`.
- **If a build phase is being declared done**: `qa-acceptance`.

## Step 4 — Consolidated report

A single markdown report with these sections:

1. **Scope** — bullet list of changes.
2. **Hard gates** — pass/fail table.
3. **Specialist findings** — one section per subagent invoked, grouped by severity.
4. **Verdict** — ✅ Ready / ⚠️ Ready with caveats / ❌ Not ready.
5. **Suggested commit + PR title** — Conventional Commits style.

## Step 5 — Do not open the PR

Stop after Step 4. The user reviews the report and decides whether to run `gh pr create`.
