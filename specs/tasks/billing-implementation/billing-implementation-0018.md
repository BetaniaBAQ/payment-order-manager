# 0018: handleStripeSubscriptionDeleted mutation

## Context

Convex mutation called when Stripe subscription is cancelled/deleted. Downgrades org to free tier.

## Dependencies

- 0009 (convex/subscriptions.ts file exists)

## File

`convex/subscriptions.ts` (add mutation)

## Requirements

```typescript
export const handleStripeSubscriptionDeleted = mutation({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => { ... }
})
```

Logic:

1. Find subscription by providerSubscriptionId (same query pattern as 0017)
2. If not found, return
3. Patch: tier=free, status=cancelled, cancelledAt=Date.now(), updatedAt=Date.now()

- Does NOT delete the record — keeps history
- Org immediately falls back to free tier limits

## Definition of Done

- [ ] Mutation exported
- [ ] Downgrades to free tier
- [ ] Sets cancelledAt timestamp
- [ ] Record preserved (not deleted)
- [ ] No-op if not found
