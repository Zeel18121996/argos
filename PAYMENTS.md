# Payments — Razorpay Integration

Internal documentation for the Razorpay payment flow used by the Argos checkout. Use this as a reference when adding new payment features, debugging payment issues, or onboarding a teammate to the payment code.

> Companion docs: [Architecture.md](./Architecture.md) for the broader app structure.

---

## 1. Overview

The app uses **Razorpay** (Indian payment gateway) for real card / UPI / wallet / net-banking payments. The flow is **not** synchronous like the original mock card processor — it is a 3-step exchange between client, server, and Razorpay:

```
┌──────────┐                    ┌──────────┐                     ┌────────────┐
│  Client  │                    │  Server  │                     │  Razorpay  │
└────┬─────┘                    └─────┬────┘                     └─────┬──────┘
     │  1. POST /checkout/create-     │                                │
     │     payment {address, method}  │                                │
     ├───────────────────────────────▶│                                │
     │                                │  orders.create({amount,INR})   │
     │                                ├───────────────────────────────▶│
     │                                │ ◀──────────── order_id ────────┤
     │ ◀── {razorpayOrderId, amount,  │                                │
     │      keyId, prefill, currency} │                                │
     │                                │                                │
     │  2. new window.Razorpay({...}).open() — popup opens             │
     │ ◀═══════════════════════════════════════════════════════════════│
     │     user pays inside Razorpay's hosted UI (card / UPI / etc.)   │
     │ ════════════════════════════════════════════════════════════════▶│
     │  handler(response) fires with:                                  │
     │   {razorpay_order_id, razorpay_payment_id, razorpay_signature}  │
     │                                │                                │
     │  3. POST /checkout/verify      │                                │
     │     {...address, ...rzpFields} │                                │
     ├───────────────────────────────▶│                                │
     │                                │ HMAC-SHA256 verify signature   │
     │                                │ → create DB order              │
     │                                │ → clear basket                 │
     │                                │ → send email                   │
     │ ◀── {orderId, orderNumber, total, status: 'confirmed'} ─────────┤
```

Why split into 2 steps? Razorpay's hosted UI lives on their domain, not ours. We can't accept card details on our server (PCI compliance), so the popup handles payment, then we verify the cryptographic signature it sends back to confirm the payment is real and untampered.

---

## 2. Environment Variables

### Server (`E:\Code\ArgosC\.env`)

| Variable | Required | Notes |
|---|---|---|
| `RAZORPAY_KEY_ID` | ✅ | Public ID, starts with `rzp_test_` (test) or `rzp_live_` (production). Safe to expose. |
| `RAZORPAY_KEY_SECRET` | ✅ | Used to (a) sign Razorpay API calls and (b) verify the payment signature. **Server-only — never ship to client.** |

These are validated by Joi at boot ([server/src/config/env.validation.ts](server/src/config/env.validation.ts)); the server will refuse to start if they are missing.

### Client (`E:\Code\ArgosC\client\.env`)

| Variable | Required | Notes |
|---|---|---|
| `VITE_RAZORPAY_KEY_ID` | ✅ | Same value as `RAZORPAY_KEY_ID`. The `VITE_` prefix is required by Vite to expose it to the browser. Used as fallback only — the server always returns the canonical `keyId` in the create-payment response. |

### How to get the credentials

1. Sign up at https://dashboard.razorpay.com/signup (email, no KYC for test mode).
2. Confirm the top-right toggle says **Test Mode** (not Live).
3. Go to **Account & Settings → API Keys** (direct: https://dashboard.razorpay.com/app/keys).
4. Click **Generate Test Key**.
5. Copy `key_id` and `key_secret`. **Secret is shown once** — download the backup or regenerate if you lose it.
6. For live mode: complete KYC (PAN, bank, business proof), then **Activate Account → Generate Live Keys**. Same code paths, just swap `rzp_test_*` → `rzp_live_*`.

### Test cards (no real money in test mode)

| Card / Method | Result |
|---|---|
| `4111 1111 1111 1111` | Success (Visa) |
| `5104 0600 0000 0008` | Failure (declined) |
| UPI VPA `success@razorpay` | Success |
| UPI VPA `failure@razorpay` | Failure |

Any future expiry (e.g. `12/30`), any 3-digit CVV, any name.

Full test card list: https://razorpay.com/docs/payments/payments/test-card-details/

---

## 3. Currency

All monetary amounts in the codebase are **integer paise** (1/100 ₹). Examples:

| Stored value | Displayed |
|---|---|
| `100` | ₹1.00 |
| `4900` | ₹49 |
| `199900` | ₹1,999 |

Helpers:
- [client/src/utils/format.ts](client/src/utils/format.ts) — `formatPrice(paise)` and `formatPriceFromPounds(rupees)` (note: the `FromPounds` name is a historical leftover; it now formats rupees and outputs ₹).
- [client/src/utils/formatPrice.ts](client/src/utils/formatPrice.ts) — `formatPrice`, `poundsToPence` (now paise), `discountPercent`.

Razorpay's API requires `amount` in paise and `currency: 'INR'`. The server passes this through verbatim.

### Delivery costs ([server/src/checkout/checkout.service.ts:130](server/src/checkout/checkout.service.ts))
```ts
case 'next_day':     return 9900   // ₹99
case 'click_collect': return 0     // free
default:             return 4900   // ₹49 standard
```

Update both server and client constants if you change these. Client copy lives at [client/src/pages/CheckoutPage.tsx](client/src/pages/CheckoutPage.tsx) in the `DELIVERY_OPTIONS` array.

---

## 4. Backend Architecture

### Module layout
```
server/src/payments/
  ├── razorpay.provider.ts      # DI factory that wires up the Razorpay SDK client
  ├── payments.service.ts       # createOrder() + verifySignature()
  ├── payments.module.ts        # Registers provider, exports PaymentsService
  └── dto/payment.dto.ts        # VerifyPaymentDto

server/src/checkout/
  ├── checkout.controller.ts    # POST /checkout/create-payment + POST /checkout/verify
  ├── checkout.service.ts       # createPayment() + verifyAndCreateOrder()
  └── dto/checkout.dto.ts       # CreateCheckoutDto + VerifyCheckoutDto
```

### Razorpay SDK client ([razorpay.provider.ts](server/src/payments/razorpay.provider.ts))
- Injection token: `RAZORPAY_CLIENT`
- Reads `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` from `ConfigService`
- Inject into any service with `@Inject(RAZORPAY_CLIENT) private readonly razorpay: Razorpay`

### `PaymentsService` ([payments.service.ts](server/src/payments/payments.service.ts))

```ts
createOrder(amount: number, receipt: string): Promise<CreateOrderResult>
  // Calls razorpay.orders.create({ amount, currency: 'INR', receipt })
  // Returns: { razorpayOrderId, amount, currency, keyId }

verifySignature(orderId: string, paymentId: string, signature: string): void
  // HMAC-SHA256(`${orderId}|${paymentId}`, RAZORPAY_KEY_SECRET)
  // Compares with crypto.timingSafeEqual to prevent timing attacks
  // Throws BadRequestException on mismatch
```

### `CheckoutService` ([checkout.service.ts](server/src/checkout/checkout.service.ts))

```ts
createPayment(userId, sessionId, dto: CreateCheckoutDto): Promise<CreatePaymentResult>
  // 1. Resolve basket (user or guest by cookie)
  // 2. validateStock() — throws if any product is unavailable
  // 3. Compute total = subtotal + deliveryCost
  // 4. paymentsService.createOrder(total, receipt)
  // 5. Return { razorpayOrderId, amount, currency, keyId, prefill }
  //
  // NOTE: No DB order is created here. Razorpay order_id alone is the link
  //       between this step and the verify step.

verifyAndCreateOrder(userId, sessionId, dto: VerifyCheckoutDto): Promise<OrderModel>
  // 1. paymentsService.verifySignature(...) — throws 400 if bad
  // 2. Re-resolve basket and re-validate stock (basket may have changed)
  // 3. ordersService.createFromBasket(...) with paymentIntentId = razorpay_payment_id
  // 4. Clear basket
  // 5. Send order confirmation email (best-effort)
```

The order is stored with `status='confirmed'`, `paymentStatus='paid'`, and `paymentIntentId` set to the Razorpay **payment** id (not the order id).

---

## 5. API Endpoints

Both endpoints are **public** (no auth required) so guest checkout works. Auth is auto-detected from JWT if present — see `resolveContext()` in [checkout.controller.ts](server/src/checkout/checkout.controller.ts).

### `POST /api/v1/checkout/create-payment`

**Request body** (`CreateCheckoutDto`):
```json
{
  "line1": "12 MG Road",
  "line2": "Flat 4B",
  "city": "Mumbai",
  "postcode": "400001",
  "firstName": "Jay",
  "lastName": "Patel",
  "phone": "9876543210",
  "email": "jay@example.com",
  "deliveryMethod": "standard"
}
```
`deliveryMethod` is one of `'standard' | 'next_day' | 'click_collect'`.

**Response**:
```json
{
  "razorpayOrderId": "order_QabcXYZ123",
  "amount": 199900,
  "currency": "INR",
  "keyId": "rzp_test_AbCdEf",
  "prefill": {
    "name": "Jay Patel",
    "email": "jay@example.com",
    "contact": "9876543210"
  }
}
```

**Errors**:
- `400 Basket is empty` — no items in basket
- `400 Only N items of "X" available` — stock validation failure
- `400 Invalid order amount` — total computed to ≤ 0

### `POST /api/v1/checkout/verify`

**Request body** (`VerifyCheckoutDto`):
```json
{
  "line1": "12 MG Road",  // ... all CreateCheckoutDto fields again
  "deliveryMethod": "standard",
  "razorpayOrderId": "order_QabcXYZ123",
  "razorpayPaymentId": "pay_QpqrSTU456",
  "razorpaySignature": "9f8d7e6c5b4a..."
}
```

**Response**:
```json
{
  "orderId": "uuid",
  "orderNumber": "ORD-1747500000000",
  "status": "confirmed",
  "total": 199900
}
```

**Errors**:
- `400 Invalid payment signature` — HMAC mismatch (tampering or wrong secret)
- `400 Basket is empty` — basket was cleared between create and verify
- `400 Only N items of "X" available` — stock changed between create and verify

---

## 6. Frontend Architecture

### Files

| File | Role |
|---|---|
| [client/index.html](client/index.html) | Loads `https://checkout.razorpay.com/v1/checkout.js` (the hosted popup) |
| [client/src/types/razorpay.d.ts](client/src/types/razorpay.d.ts) | TypeScript declarations for `window.Razorpay` and the popup options |
| [client/src/services/ordersApi.ts](client/src/services/ordersApi.ts) | RTK Query mutations: `useCreatePaymentMutation`, `useVerifyPaymentMutation` |
| [client/src/pages/CheckoutPage.tsx](client/src/pages/CheckoutPage.tsx) | The actual checkout page wired into the router |

> ⚠️ `client/src/pages/Checkout/Checkout.tsx` is **dead code** — an older prototype not wired into the active router ([client/src/router/index.tsx](client/src/router/index.tsx)). Leave it alone or delete it; don't edit it for payment work.

### Popup flow ([CheckoutPage.tsx](client/src/pages/CheckoutPage.tsx))

```ts
const rzpOrder = await createPayment(addressPayload).unwrap()

const razorpay = new window.Razorpay({
  key:        rzpOrder.keyId,
  amount:     rzpOrder.amount,         // paise
  currency:   rzpOrder.currency,       // 'INR'
  name:       'Argos',
  description:'Order payment',
  order_id:   rzpOrder.razorpayOrderId,
  prefill:    rzpOrder.prefill,
  theme:      { color: '#D42114' },    // brand red
  modal: {
    ondismiss: () => { /* user closed popup */ },
  },
  handler: async (response) => {
    // response = { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    await verifyPayment({ ...addressPayload, ...response }).unwrap()
    // → navigate to confirmation page
  },
})

razorpay.open()
```

### Defensive checks
- Always check `typeof window.Razorpay === 'function'` before invoking — the CDN script may fail to load.
- The `modal.ondismiss` handler runs if the user closes the popup without paying. Show a "you can try again" message; do **not** mark the order as failed (no order exists yet at this point).
- Verify errors (signature mismatch, stock changed) should surface as toast errors and let the user retry. Do not navigate away.

---

## 7. Order Lifecycle (with Razorpay)

```
┌─────────────────────────────────────────────────────────────┐
│ User on /checkout                                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼ (clicks "Pay with Razorpay")
┌─────────────────────────────────────────────────────────────┐
│ POST /checkout/create-payment                               │
│   ↳ basket validated, stock checked                         │
│   ↳ razorpay.orders.create() → order_id                     │
│   ↳ No DB order written yet                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼ (popup opens)
┌─────────────────────────────────────────────────────────────┐
│ User pays via UPI / card / wallet / net-banking             │
│   ↳ Razorpay validates payment                              │
│   ↳ handler() fires with { order_id, payment_id, signature }│
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ POST /checkout/verify                                       │
│   ↳ verify HMAC signature                                   │
│   ↳ DB order created: status='confirmed', paymentStatus='paid' │
│   ↳ Basket cleared                                          │
│   ↳ Confirmation email sent                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
                  /checkout/confirmation/:orderId
```

### Edge cases

| Scenario | Outcome |
|---|---|
| User closes popup before paying | No DB order. Basket retained. Razorpay order is dangling (cleaned up by Razorpay after 24h). Show toast: "Payment cancelled". |
| Verify call fails (signature mismatch) | No DB order. Basket retained. User can retry. |
| Verify call fails (basket empty / stock gone) | No DB order despite payment success. **Money is captured by Razorpay** — manual refund required from dashboard. Add a webhook to handle this gracefully (see §10). |
| Tab closed mid-payment after successful capture | No DB order. **Money is captured** — same manual refund issue. Webhook needed. |
| Same verify request submitted twice (double-click) | Second call fails because basket is already cleared. Safe but ugly UX — should add idempotency. |

---

## 8. Security Notes

- **Signature verification is non-negotiable.** Without it, anyone can POST a fake `payment_id` to `/checkout/verify` and trigger order creation without paying. We use `crypto.timingSafeEqual` to prevent timing attacks.
- The Razorpay `key_secret` must NEVER appear in the client bundle, git, public Slack channels, or screenshots. If leaked, regenerate immediately from the dashboard.
- **All amount calculations happen server-side.** The client never sends a price — only basket contents and address. The server computes total based on basket + delivery method to prevent price tampering.
- Validate stock **twice**: once in `createPayment` (to fail fast), and again in `verifyAndCreateOrder` (race condition: another user may have bought it during the popup).
- Public routes (`@Public()` decorator) are intentional — guest checkout is supported via the `argos_session` cookie. Don't change this without considering the impact on logged-out users.

---

## 9. Common Issues & Fixes

### "Payment library failed to load"
The Razorpay script tag in [client/index.html](client/index.html) didn't load. Check:
- Network tab in DevTools for the script request.
- Ad-blockers / network policies blocking `checkout.razorpay.com`.
- CSP headers, if any, must whitelist `checkout.razorpay.com`.

### "Invalid payment signature"
- The `RAZORPAY_KEY_SECRET` on the server doesn't match the dashboard key whose `key_id` was used. Most common cause: copy-paste truncation.
- The order was created in test mode but the secret is from live mode (or vice versa). Test and live keys are different.
- Confirm by manually computing: `crypto.createHmac('sha256', secret).update(`${order_id}|${payment_id}`).digest('hex')` and comparing.

### "Cannot find module 'razorpay'"
- Run `npm install --prefix server` to ensure the SDK is installed.
- Confirm `razorpay` is in `server/package.json` dependencies.

### Popup opens but stays empty / spins forever
- The `order_id` passed to the popup doesn't exist in Razorpay's system (e.g., used live order_id with test keys).
- Network restrictions in your environment blocking Razorpay's APIs.

### Build fails with currency type errors
- Razorpay's TS types for `amount` allow both `string | number`. We normalize to `number` in the service layer.
- If you upgrade the `razorpay` SDK, check breaking changes in `orders.create` typings.

---

## 10. Deferred / Future Work

These are intentionally out of scope for the current implementation but should be added before going live with real money.

### Webhooks
Razorpay sends server-to-server webhook events (`payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, `refund.failed`). These are the **source of truth** for payment status, especially when:
- The user's tab closes between payment and verify (we miss the verify call but Razorpay still captures the money).
- Refunds happen from the dashboard (we never get a verify-style call for these).

**To implement:**
1. Add `RAZORPAY_WEBHOOK_SECRET` to `.env` and `env.validation.ts`.
2. Configure webhook URL in dashboard: `https://<public-url>/api/v1/webhooks/razorpay`. For local dev use ngrok: `ngrok http 4000`.
3. Add a `WebhooksController` at `server/src/payments/webhooks.controller.ts`:
   - `@Public()`, accepts raw body (NestJS `@RawBody()` or `bodyParser.raw({ type: 'application/json' })` scoped to `/webhooks/*`).
   - Verify `x-razorpay-signature` header with HMAC-SHA256 over the **raw body** using `RAZORPAY_WEBHOOK_SECRET`.
   - Idempotent handlers: matching events may arrive twice; check current order state before mutating.
4. Add `razorpay_order_id` column on the `orders` table (currently we only store `razorpay_payment_id` as `paymentIntentId`). Without it, webhook → order lookup requires an extra column or a Redis cache mapping `order_id → orderId`.
5. Handle events:
   - `payment.captured` → ensure `paymentStatus='paid'` (idempotent).
   - `payment.failed` → `paymentStatus='failed'`, `status='cancelled'`, restore stock via `ordersService.restoreStock(orderId)`.
   - `refund.processed` → `paymentStatus='refunded'`, `status='refunded'`.

### Pre-paid pending orders
Currently we don't write a DB order during `createPayment`. If the user pays but never reaches `/verify`, the money is captured with no DB record. To fix:
- Write a `status='pending'`, `paymentStatus='pending'` order during `createPayment` keyed by `razorpay_order_id`.
- Webhook updates this order to `confirmed/paid` on `payment.captured` even if the verify endpoint never runs.

### Saved cards / tokenization
Razorpay supports card tokenization for repeat customers. Out of scope for v1; see https://razorpay.com/docs/payments/cards/tokenization/.

### Subscriptions / recurring payments
Different Razorpay product (`razorpay.subscriptions.create`). Not currently used.

### Refunds from the admin UI
Currently refunds require dashboard access. To add an admin button:
- `razorpay.payments.refund(paymentId, { amount, speed: 'normal' })`.
- Update `paymentStatus='refunded'`, `status='refunded'`.
- Restore stock.
- Trust the `refund.processed` webhook to be the source of truth.

### Partial refunds
Razorpay supports partial refunds. Would need a `refunds` table to track per-payment refund history.

### COD (Cash on Delivery)
Out of scope. Razorpay supports COD as a method but requires enabling on the account. Would also need an order workflow change (`status='cod_pending'`).

### Multi-currency
The current code is hardcoded to `INR`. To support multi-currency, enable international payments in the Razorpay account (needs extra KYC) and add a `currency` field to the basket / order.

---

## 11. Files Touched in This Integration

For reference when reading git history.

**Server:**
- `server/package.json` — added `razorpay`
- `server/src/config/env.validation.ts` — Joi schema
- `server/src/payments/razorpay.provider.ts` *(new)*
- `server/src/payments/payments.service.ts` — rewritten
- `server/src/payments/dto/payment.dto.ts` — replaced
- `server/src/payments/payments.module.ts` — registers provider
- `server/src/payments/payments.controller.ts` *(deleted)*
- `server/src/checkout/dto/checkout.dto.ts` — split DTOs
- `server/src/checkout/checkout.service.ts` — split flow, INR delivery costs
- `server/src/checkout/checkout.controller.ts` — 2 endpoints
- `.env.example` — Razorpay vars

**Client:**
- `client/index.html` — Razorpay CDN script tag
- `client/src/types/razorpay.d.ts` *(new)*
- `client/src/utils/format.ts` — ₹ formatting
- `client/src/utils/formatPrice.ts` — ₹ formatting
- `client/src/services/ordersApi.ts` — split mutations
- `client/src/pages/CheckoutPage.tsx` — popup invocation
- `client/src/components/home/PromoInfoBar.tsx` — copy fix
- `client/src/components/Layouts/Header/PromoStrip.tsx` — copy fix
- `client/src/pages/Category/Category.tsx` — copy fix
- `client/src/pages/HomePage.tsx` — copy fix
- `client/.env.example` — `VITE_RAZORPAY_KEY_ID`

---

## 12. References

- Razorpay docs: https://razorpay.com/docs/
- Standard Checkout (popup): https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
- Server SDK (Node.js): https://github.com/razorpay/razorpay-node
- Signature verification: https://razorpay.com/docs/payments/payments/verify-payment/
- Webhooks: https://razorpay.com/docs/webhooks/
- Test cards: https://razorpay.com/docs/payments/payments/test-card-details/
- Dashboard: https://dashboard.razorpay.com/
