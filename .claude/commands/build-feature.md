---
description: Build a full vertical-slice feature in ArgosC — server module + migration + client feature + RTK Query endpoints + tests.
argument-hint: <feature-name> [admin|customer]
---

You are running the `/build-feature` workflow for the ArgosC project. The user wants a full vertical slice of feature: **$ARGUMENTS**.

Follow this exact sequence and check in after each major step:

## Step 1 — Clarify scope

Ask the user (one combined `AskUserQuestion` call):

1. Resource shape — fields and types.
2. Customer-facing or admin-only?
3. Endpoints needed (default: list, get one, create, patch, delete).
4. Does the client need a dedicated page or only data hooks?

## Step 2 — Server

1. Trigger the `nestjs-module-scaffold` skill to create the module.
2. Trigger the `sequelize-migration` skill for the matching migration.
3. Run `npm run lint` and `npm run build` in `server/`. Fix all errors before continuing.
4. Run `npm run test -- {feature}` and address failures.

## Step 3 — Client

1. Trigger the `react-feature-slice` skill to create `client/src/features/{feature}/`.
2. Trigger the `rtk-query-endpoint` skill to wire the endpoints from Step 2 into `client/src/services/{resource}Api.ts`.
3. If a page is needed, add it to `client/src/router/index.tsx` (lazy-loaded) and register the path in `client/src/router/paths.ts`.
4. Run `npm run lint` and `npm run typecheck` in `client/`. Fix errors.

## Step 4 — Cross-cutting reviews

Spawn these subagents in parallel:

- `api-contract-checker` — server ↔ client contract.
- `access-control-auditor` — guards and roles match.
- `ui-pixel-reviewer` — if a UI page was added.

## Step 5 — Wrap-up

1. Report: files added, files modified, test results, subagent findings.
2. Suggest a Conventional Commit message: `feat({feature}): <one-line summary>`.
3. Do **not** commit unless the user says so.
