# Skill: Argos Clone — QA Acceptance

## When to use this skill

Read this before declaring any phase done. A phase isn't done because the code compiles — it's done when every applicable box below ticks.

---

## Universal acceptance gates (every phase)

A vertical slice is **not done** until all of these are true for every page/feature it touches.

### 1. Loading

- [ ] Initial render shows a **skeleton** (shimmer placeholder matching the final layout), NOT a spinner, NOT a blank screen.
- [ ] Skeletons match real content geometry — same heights, same grid, same number of placeholder rows as expected.
- [ ] No layout shift when real data replaces skeleton.

### 2. Real data path

- [ ] The page renders with real data from the API (no hardcoded mock arrays left behind).
- [ ] Pagination / sort / filters work and update the URL.
- [ ] Refreshing the URL preserves the visible state (filters, page, search query).

### 3. Empty state

- [ ] When the API returns `[]` or `null`, an `<EmptyState>` renders with: an icon, a friendly title, optional CTA.
- [ ] Empty state never looks "broken" — never a half-render with missing fields.

### 4. Error state

- [ ] When the API returns 4xx/5xx, `<ApiError>` renders with a clear message and a "Try again" button.
- [ ] Network failure (offline) gets the same treatment, not a console error.
- [ ] Validation errors from the server (`errors: [{ field, message }]`) render inline on the matching form field.

### 5. Responsive

Test at **all four** widths:

| Width   | Device class                |
| ------- | --------------------------- |
| 360 px  | small mobile (iPhone SE)    |
| 768 px  | tablet portrait             |
| 1280 px | desktop (max content width) |
| 1920 px | wide desktop                |

- [ ] No horizontal scroll at any width.
- [ ] Touch targets ≥ 44 × 44 on mobile.
- [ ] Header collapses correctly on mobile (top bar hidden, hamburger visible, search becomes icon-only until tapped).
- [ ] Drawers (basket, filter, mobile nav) take full screen on mobile, side panel on desktop.

### 6. Accessibility (WCAG 2.1 AA)

- [ ] Every interactive element is keyboard-reachable in a sensible tab order.
- [ ] Every interactive element has a visible `:focus-visible` outline (don't kill it with `outline: none`).
- [ ] Modals/drawers trap focus while open; Escape closes them; focus returns to the trigger on close.
- [ ] All images have `alt` text (use `alt=""` for purely decorative images, never omit the attribute).
- [ ] Form labels are properly associated (`<label htmlFor>` or wrap, never just a placeholder).
- [ ] Colour contrast meets AA: body text ≥ 4.5:1, large text (18 px+ / 14 px bold+) ≥ 3:1, UI components ≥ 3:1. Check with the browser devtools contrast tool on any new colour pairing.
- [ ] Status messages use `role="status"` (polite) or `role="alert"` (assertive) so screen readers announce them.
- [ ] `<h1>` per page; heading levels nest correctly (don't jump from h2 to h4).

### 7. Performance

Lighthouse mobile (incognito) targets:

| Metric         | Target |
| -------------- | ------ |
| Performance    | ≥ 90   |
| Accessibility  | ≥ 95   |
| Best Practices | ≥ 95   |
| SEO            | ≥ 95   |

- [ ] All `<img>` tags have explicit `width` + `height` (no CLS).
- [ ] Below-the-fold images use `loading="lazy"`.
- [ ] No unused JS bundles bigger than 50 kB on first load (check Vite build output).
- [ ] Critical fonts preloaded (Argos uses system Arial — no custom font preloads needed).

### 8. Code hygiene

- [ ] No `console.log` / `console.warn` / `debugger` left in shipped code.
- [ ] No TODO/FIXME left without a tracking issue or a `// FIXME(phase-X)` note tying it to the deferred work.
- [ ] `npm run lint` clean in both `client/` and `server/`.
- [ ] `npm run test` clean.
- [ ] No `.skip` / `xfail` tests without a written reason.

---

## Per-phase acceptance

### Phase 0 — Foundations

- [ ] `git log --oneline` shows initial commit; `git status` clean.
- [ ] `docker compose up -d` brings up postgres + redis + mailhog + server + client healthy.
- [ ] Husky hooks fire: a broken commit message is rejected; lint-staged runs on `git commit`.
- [ ] All 12 skill files in `.warp/skills/` exist; `WARP.md` links them.
- [ ] `Architecture.md` matches actual stack (no TypeORM/MinIO/Stripe references).

### Phase 1 — Auth & Users

- [ ] Register with an existing email returns 409 with a useful message.
- [ ] Login sets the `refreshToken` httpOnly cookie (verify in browser devtools, `HttpOnly` + `Secure` (in prod) + `SameSite=Lax`).
- [ ] Customer redirects to `/`; staff/admin redirect to `/admin`.
- [ ] Manually expiring the access token (set short TTL) → next API call silently refreshes once, then succeeds.
- [ ] Logout revokes the refresh token row in DB (`revoked = true`).
- [ ] `/admin` access as customer redirects to `/`.
- [ ] `/admin/users` access as staff returns 403.

### Phase 2 — Catalogue

- [ ] Homepage shows seeded categories + a carousel of seeded products.
- [ ] Browse → category filters returns correct counts.
- [ ] Sort by price ASC orders correctly (including products with `salePrice`).
- [ ] PDP shows real images at 3 resolutions (small in thumbnails, medium in main, large in lightbox).
- [ ] Admin can create a product → it appears immediately on the customer homepage (RTK Query invalidation works).
- [ ] Deactivating a product (admin) → it disappears from customer browse but stays in admin list.

### Phase 3 — Basket & Wishlist

- [ ] Add to basket as guest → close tab → reopen → basket persists.
- [ ] Login → guest basket merges with user basket (no duplicate lines; quantities sum).
- [ ] Remove last item → empty state with "Continue shopping" CTA.
- [ ] Quantity stepper enforces min 1, max stock; live updates totals.
- [ ] Wishlist heart toggles on PDP and on product cards; state synced across both.

### Phase 4 — Checkout, Orders, Payments

- [ ] Complete a checkout with any test card → confirmation page shows the order number.
- [ ] Checkout with card `4000000000000002` → payment fails with inline error, order not created.
- [ ] Order appears in `/account/orders` (customer) and in `/admin/orders` (admin).
- [ ] MailHog (http://localhost:8025) shows the order confirmation email.
- [ ] Admin status transition (pending → confirmed → … → delivered) updates the timeline on `/order/tracking?orderId=...&postcode=...`.
- [ ] Invalid status transition returns 400 with a clear error.

### Phase 5 — Admin Panel

- [ ] Dashboard cards show real counts (today's orders, today's revenue in pence formatted to £, total products, total customers).
- [ ] Customers table search by email returns instant results (debounced 300 ms).
- [ ] Deactivating a customer prevents their next login (401 on auth).
- [ ] Promoting a customer to staff (admin-only) shows the re-login warning toast.
- [ ] Category create → appears in the customer mega-menu after page refresh.

### Phase 6 — Reviews, Promotions, Stores, Help

- [ ] Customer with a delivered order can review the product; customer without cannot.
- [ ] Pending review NOT shown on PDP; staff approves → it appears.
- [ ] Promo code applied at basket → discount line item; total recalculates.
- [ ] Invalid/expired promo code shows inline error, doesn't crash.
- [ ] `/stores` page lists all seeded stores; filter by city works.
- [ ] `/help/<slug>` renders the markdown article; broken slug shows 404 (not a server error).

### Phase 7 — Polish & Production-Readiness

- [ ] Run the universal gates above for **every** customer page + admin page.
- [ ] Lighthouse run on homepage, browse, PDP, basket — all hit the targets.
- [ ] `npm run test:cov` in `client/` and `server/` meets the targets in `testing.md`.
- [ ] README has: quickstart, env table, scripts, screenshots, links.
- [ ] `v1.0.0` tag pushed to GitHub.

---

## Browser matrix

Test the customer site at least once per phase in:

- Chrome (latest) — primary
- Firefox (latest) — JS engine difference
- Safari (latest, macOS) — webkit quirks
- Edge (latest) — Chromium parity check
- Mobile: Chrome Android + Safari iOS (real device or BrowserStack if available)

Admin site only needs Chrome + Firefox.

---

## What "production-ready" means here

It does **not** mean it's deployed to a public cloud with a CDN. For this project it means:

1. End-to-end happy paths work without errors.
2. Edge cases (empty/error/offline) are handled gracefully.
3. The codebase has tests, linting, hooks, and docs that let another engineer pick it up.
4. There are no obvious security holes (no plaintext passwords; auth tokens are httpOnly cookies; SQL is parameterised by Sequelize; CORS is restricted to `CLIENT_URL`; rate limiting on auth endpoints).
5. The build is reproducible from a fresh clone in under 10 minutes following the README.

---

## Common Pitfalls

- **Skipping skeleton states.** "It loads fast on my machine" doesn't survive a real network. Always build with skeletons first.
- **Skipping the empty state.** When tested with no data, half the dev's pages collapse into nothing or NaN.
- **Ignoring the keyboard.** Mouse-only testing misses focus traps in modals, missing tab orders, invisible focus rings.
- **Ignoring mobile until the end.** Mobile-first means designing at 360 px first, not testing at 360 px last.
- **Trusting the dev-mode bundle.** Always run `npm run build && npm run preview` before declaring done — the production bundle behaves differently (no React DevTools fallback rendering, no helpful warnings).
