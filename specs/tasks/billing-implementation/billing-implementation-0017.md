# 0017: handleStripeSubscriptionUpdate mutation

## Context

Convex mutation called on `customer.subscription.updated` Stripe event. Syncs subscription status and billing period from Stripe to Convex.

## Dependencies

- 0009 (convex/subscriptions.ts file exists)

## File

`convex/subscriptions.ts` (add mutation)

## Requirements

```typescript
export const handleStripeSubscriptionUpdate = mutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.string(),               // Stripe status
    currentPeriodStart: v.number(),    // already in ms (converted by webhook route)
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => { ... }
})
```

Logic:

1. Find subscription: query by `by_provider_customer` index (paymentProvider=stripe), then filter by providerSubscriptionId
2. If not found, return (no-op)
3. Map Stripe status → internal status using object map:
   - `active` → `active`
   - `past_due` → `past_due`
   - `canceled` → `cancelled`
   - `unpaid` → `past_due`
   - default → `active`
4. Patch: status, currentPeriodStart, currentPeriodEnd, updatedAt

## Resources

- [Stripe Subscription Statuses](https://docs.stripe.com/api/subscriptions/object#subscription_object-status)

## Definition of Done

- [ ] Mutation exported
- [ ] Finds subscription by Stripe subscription ID
- [ ] Status mapping uses object map (not switch)
- [ ] Period timestamps synced
- [ ] No-op if subscription not found
