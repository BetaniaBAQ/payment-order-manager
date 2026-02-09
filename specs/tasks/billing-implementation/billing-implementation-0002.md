# 0002: Payment events table schema

## Context

Audit log for every billing event: webhook deliveries, payment successes/failures, subscription changes. Used for idempotency (prevent duplicate webhook processing) and debugging.

## Dependencies

- 0001 (subscriptions table — references `v.id('subscriptions')`)

## File

`convex/schema/paymentEvents.ts` (new)

## Requirements

```typescript
import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const paymentEvents = defineTable({
  subscriptionId: v.id('subscriptions'),
  provider: v.union(v.literal('wompi'), v.literal('stripe')),
  eventType: v.string(), // "payment.approved", "payment.declined", "subscription.cancelled"
  providerEventId: v.optional(v.string()), // Wompi transactionId or Stripe event ID, for idempotency
  amount: v.optional(v.number()),
  currency: v.optional(v.string()),
  paymentMethod: v.optional(v.string()), // "pse", "nequi", "card", "bancolombia"
  metadata: v.optional(v.any()),
  createdAt: v.number(),
})
  .index('by_subscription', ['subscriptionId'])
  .index('by_provider_event', ['provider', 'providerEventId'])
```

- `by_provider_event` compound index enables idempotency check: query by (provider, providerEventId) before processing

## Resources

- [Convex Schema Docs](https://docs.convex.dev/database/schemas)

## Definition of Done

- [ ] File exists at `convex/schema/paymentEvents.ts`
- [ ] Exports `paymentEvents` table definition
- [ ] `subscriptionId` correctly references subscriptions table
- [ ] Both indexes defined
- [ ] No TypeScript errors
