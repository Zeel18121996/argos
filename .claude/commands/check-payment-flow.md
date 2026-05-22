---
description: Run the simulated payment flow checks for ArgosC — verifies the declined-card path, the approved path, the order side effects, and that no real payment SDK was introduced.
---

You are running `/check-payment-flow`. The ArgosC payment system is **simulated** — see [`PAYMENTS.md`](../../PAYMENTS.md). Your job is to delegate the audit to the `payment-tester` subagent and surface a clean pass/fail back to the user.

## Step 1 — Pre-flight

1. `git diff` to show what changed under:
   - `server/src/payments/`
   - `server/src/checkout/`
   - `server/src/orders/`
   - `client/src/features/checkout/`
2. If none of those changed, ask the user whether they still want a full run.

## Step 2 — Run the audit

Spawn the `payment-tester` subagent. Pass it:

- The diff from Step 1 (so it knows what changed).
- Reminder: "card `4000000000000002` must always fail; everything else must succeed; no real SDK".

## Step 3 — Surface findings

After the subagent returns, report:

- **Pass / Fail** verdict (one word).
- Failing tests, if any, with the path and the assertion that failed.
- Forbidden SDK imports detected (should be none).
- Whether logs mask the PAN correctly.
- Whether [`PAYMENTS.md`](../../PAYMENTS.md) and the implementation still agree.

## Step 4 — Suggest next steps

If Fail: list the smallest set of fixes. Do not edit code unless the user asks.
If Pass: confirm the user is clear to merge the checkout-touching work.
