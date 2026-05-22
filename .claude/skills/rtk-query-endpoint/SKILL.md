---
name: rtk-query-endpoint
description: Add one or more endpoints (query or mutation) to an existing RTK Query service in client/src/services/. Use when the user wants to "add an API call", "wire up an endpoint", "expose a new query/mutation" to the frontend. Picks the correct service file by URL prefix, injects endpoints with granular cache tags, and exports the generated hooks.
---

# Skill: rtk-query-endpoint

Adds endpoints to an existing `*Api.ts` in `client/src/services/` while keeping cache invalidation granular and types aligned with the server DTOs.

## Inputs needed

1. **Resource** (e.g. `products`, `basket`, `orders`) — determines the file: `client/src/services/{resource}Api.ts`.
2. **Endpoint** spec:
   - HTTP method (`GET` / `POST` / `PATCH` / `PUT` / `DELETE`).
   - Path (already prefixed `/api/v1/` by the base query — supply the remainder, e.g. `/products/:id/reviews`).
   - Request body / query params shape.
   - Response shape (post-`ResponseWrapper` unwrap).
3. **Cache strategy** — list-affecting mutation vs single-resource mutation.

## What to produce

1. Open the existing `*Api.ts`. If the file does not exist, the user wants a new service — direct them to the `react-feature-slice` skill instead, or scaffold the bare service first.
2. Add the endpoint inside `baseApi.injectEndpoints((build) => ({ … }))`.
3. **Cache tags**:
   - Single-resource read → `providesTags: (result, _err, id) => [{ type: 'X', id }]`.
   - List read → `providesTags: (result) => result ? [...result.map(({ id }) => ({ type: 'X', id })), { type: 'X', id: 'LIST' }] : [{ type: 'X', id: 'LIST' }]`.
   - Update on one resource → `invalidatesTags: (_r, _e, { id }) => [{ type: 'X', id }]`.
   - Create / delete → `invalidatesTags: [{ type: 'X', id: 'LIST' }]`.
4. **Types**: import the request DTO type and the response interface. If they live in `client/src/types/`, reuse; otherwise define inside `*Api.ts` and consider promoting later.
5. Export the auto-generated hook(s) at the bottom of the file: `export const { useGetXQuery, useCreateXMutation } = xApi;`.

## Conventions to enforce

- Never create a second `createApi()` — always `baseApi.injectEndpoints`.
- Never use the broad `['X']` tag — always granular or list-level (`{ id: 'LIST' }`).
- For paginated list endpoints, include `page` and `limit` in the request type with the same defaults the server enforces (1 and 30).
- Response type must match what the **controller** returns after the `ResponseWrapper` interceptor unwraps — usually plain `T` or `{ items: T[]; total: number }` for paginated lists.

## After adding

1. `npm run typecheck` in `client/` — fail fast if the response shape disagrees with the server.
2. Optionally spawn the `api-contract-checker` subagent for a final consistency pass.
