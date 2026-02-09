# 0014: Stripe webhook API route

## Context

TanStack Start API route receiving Stripe webhook events. Must verify signature using Stripe SDK and forward to appropriate Convex mutation.

## Dependencies

- 0011 (stripe client)
- 0016-0019 (Convex mutations — can stub first)

## File

`src/routes/api/webhooks/stripe.ts` (new)

## Requirements

POST handler:

1. Read raw body as text (NOT JSON — Stripe needs raw body for signature)
2. Get `stripe-signature` header
3. Verify: `stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)` — return 400 on error
4. Route by `event.type` using object map (not switch):
   - `checkout.session.completed` → `api.subscriptions.handleStripeCheckout` with `{ sessionId, customerId, subscriptionId, organizationId: metadata.organizationId, tier: metadata.tier }`
   - `customer.subscription.updated` → `api.subscriptions.handleStripeSubscriptionUpdate` with `{ stripeSubscriptionId, status, currentPeriodStart: *1000, currentPeriodEnd: *1000 }`
   - `customer.subscription.deleted` → `api.subscriptions.handleStripeSubscriptionDeleted` with `{ stripeSubscriptionId }`
   - `invoice.payment_failed` → `api.subscriptions.handlePaymentFailed` with `{ stripeSubscriptionId: invoice.subscription, provider: 'stripe' }`
5. Call via `ConvexHttpClient`
6. Return 200 `{ ok: true }`

Note: Stripe timestamps are in seconds, Convex uses milliseconds — multiply by 1000.

## Resources

- [Stripe Webhooks](https://docs.stripe.com/webhooks)
- [Stripe Webhook Signature Verification](https://docs.stripe.com/webhooks/signatures)
- Local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Definition of Done

- [ ] File exists at `src/routes/api/webhooks/stripe.ts`
- [ ] POST handler exported
- [ ] Raw body read (not parsed JSON)
- [ ] Signature verified via Stripe SDK
- [ ] All 4 event types handled
- [ ] Timestamps converted from seconds to ms
- [ ] Uses object map pattern (not switch)
- [ ] Configure webhook endpoint in Stripe Dashboard
