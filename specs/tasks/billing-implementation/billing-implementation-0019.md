# 0019: handlePaymentFailed mutation

## Context

Convex mutation for failed payment events from either provider. Marks subscription as past_due and triggers notification email.

## Dependencies

- 0009 (convex/subscriptions.ts file exists)
- 0023 (PAYMENT_FAILED email template — can stub email scheduling)

## File

`convex/subscriptions.ts` (add mutation)

## Requirements

```typescript
export const handlePaymentFailed = mutation({
  args: {
    stripeSubscriptionId: v.optional(v.string()),
    wompiReference: v.optional(v.string()),
    provider: v.string(),
  },
  handler: async (ctx, args) => { ... }
})
```

Logic:

1. Find subscription:
   - If provider=stripe: find by providerSubscriptionId
   - If provider=wompi: parse reference to get orgId, find by organization
2. If not found, return
3. Patch: status=past_due, updatedAt
4. Schedule email: `ctx.scheduler.runAfter(0, internal.emails.send, { type: 'PAYMENT_FAILED', subscriptionId: sub._id })`

- Email scheduling can be stubbed initially (just log) if 0023 not done yet

## Definition of Done

- [ ] Mutation exported
- [ ] Handles both providers
- [ ] Marks subscription past_due
- [ ] Schedules failure notification email (or logs if email not ready)
