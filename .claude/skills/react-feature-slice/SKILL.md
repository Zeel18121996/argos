---
name: react-feature-slice
description: Scaffold a self-contained React feature folder under client/src/features/ — slice, RTK Query endpoints injection, components, hooks, types, and tests, following the ArgosC frontend conventions. Use when the user asks to "add a feature", "create a new feature slice", "add a wishlist/basket/auth module" to the client, or anything that lives under client/src/features/.
---

# Skill: react-feature-slice

Generates a feature folder that conforms to the ArgosC frontend conventions in [`client/CLAUDE.md`](../../../client/CLAUDE.md).

## Inputs needed

1. **Feature name** in camelCase (e.g. `wishlist`, `orderTracking`).
2. **Server resource** it maps to (e.g. `/api/v1/wishlist`) — to wire up RTK Query.
3. Whether it has **client-only global state** (e.g. UI panel open/closed) → needs a Redux slice.
4. **Page components** that own it (so we know who imports it).

## Layout to produce

```
client/src/features/{featureName}/
  index.ts                          ← barrel exporting public API
  {FeatureName}Page.tsx             ← optional: a top-level page (default export, lazy-loaded)
  components/
    {FeatureComponent}.tsx          ← named exports, ≤150 lines
    {FeatureComponent}.test.tsx
  hooks/
    use{Feature}.ts                 ← composes RTK Query + selectors
  slice.ts                          ← only if client-only state is needed
  selectors.ts                      ← createSelector memoised selectors
  types.ts                          ← feature-local types
  schemas.ts                        ← Zod schemas for forms
```

Then update `client/src/services/{resource}Api.ts` to inject the endpoints, and register the slice in `client/src/app/store.ts` if one exists.

## Template rules

- **Components**: named exports. Under 150 lines — split if larger. `data-testid` on interactive elements. Use `cn()` for class merging.
- **Hooks**: prefix `use`. Compose RTK Query hooks + memoised selectors. Do not fetch in components directly.
- **Slice**: `status: 'idle' | 'loading' | 'succeeded' | 'failed'`, `error: string | null`. No derived data in state.
- **RTK Query**: inject via `baseApi.injectEndpoints` in `client/src/services/{resource}Api.ts`. Use granular cache tags `[{ type: 'X', id }]`.
- **Forms**: React Hook Form + Zod via `@hookform/resolvers/zod`. Never hand-roll validation.
- **Routes**: add path constants to `client/src/router/paths.ts` — never hardcode URLs in JSX.
- **Tests**: every component has a co-located `.test.tsx` covering loading, error, happy path. Mock with MSW.

## After scaffolding

1. Run `npm run lint` + `npm run typecheck` in `client/` and fix any errors.
2. If a page was created, lazy-load it in `client/src/router/index.tsx`.
3. Suggest invoking the `ui-pixel-reviewer` subagent once the UI is filled in.
