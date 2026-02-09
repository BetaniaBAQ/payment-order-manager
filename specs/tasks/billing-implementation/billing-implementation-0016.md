# 0016: handleStripeCheckout mutation

## Context

Convex mutation called after Stripe Checkout Session completes (via webhook 0014). Creates or upgrades subscription record. organizationId and tier passed via Stripe session metadata.

## Dependencies

- 0009 (convex/subscriptions.ts file exists)

## File

`convex/subscriptions.ts` (add mutation)

## Requirements

```typescript
export const handleStripeCheckout = mutation({
  args: {
    sessionId: v.string(),
    customerId: v.string(),       // Stripe cus_xxx
    subscriptionId: v.string(),   // Stripe sub_xxx
    organizationId: v.string(),   // from session.metadata
    tier: v.string(),             // from session.metadata
  },
  handler: async (ctx, args) => { ... }
})
```

Logic:

1. Query existing subscription by `by_organization` index
2. **If exists** (upgrade): patch tier, paymentProvider=stripe, providerCustomerId, providerSubscriptionId, status=active, updatedAt
3. **If not** (new): insert full record — provider=stripe, currency=USD, billingInterval=monthly, all usage counters=0
4. amountPerPeriod=0 for Stripe (Stripe manages pricing)

## Resources

- [Stripe Checkout Session Object](https://docs.stripe.com/api/checkout/sessions/object)

## Definition of Done

- [ ] Mutation exported
- [ ] Handles both new subscription and upgrade
- [ ] Stores Stripe customer ID and subscription ID
- [ ] Sets provider=stripe, currency=USD
- [ ] Status set to active
