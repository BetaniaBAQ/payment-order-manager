# 0001: Subscriptions table schema

## Context

Provider-agnostic subscription record. One per organization. Tracks tier, billing state, usage counters, and payment provider details for both Wompi (CO) and Stripe (global).

## Dependencies

None

## File

`convex/schema/subscriptions.ts` (new)

## Requirements

```typescript
import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const subscriptions = defineTable({
  organizationId: v.id('organizations'),
  tier: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')),
  billingInterval: v.union(v.literal('monthly'), v.literal('annual')),
  paymentProvider: v.union(
    v.literal('wompi'),
    v.literal('stripe'),
    v.literal('none'),
  ),
  providerCustomerId: v.optional(v.string()), // Stripe: cus_xxx
  providerSubscriptionId: v.optional(v.string()), // Stripe: sub_xxx
  providerPaymentSourceId: v.optional(v.string()), // Wompi: tokenized card source ID
  status: v.union(
    v.literal('active'),
    v.literal('past_due'),
    v.literal('cancelled'),
    v.literal('pending_payment'),
  ),
  currency: v.string(), // "COP" or "USD"
  amountPerPeriod: v.number(), // smallest unit: centavos COP or cents USD
  currentPeriodStart: v.number(),
  currentPeriodEnd: v.number(),
  ordersUsedThisMonth: v.number(),
  storageUsedBytes: v.number(),
  emailsSentThisMonth: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  cancelledAt: v.optional(v.number()),
})
  .index('by_organization', ['organizationId'])
  .index('by_provider_customer', ['paymentProvider', 'providerCustomerId'])
  .index('by_status', ['status'])
```

- Follow existing schema pattern in `convex/schema/` (see `orders.ts`, `profiles.ts` for reference)
- Use `defineTable` + `v` validators
- All timestamps in ms (Date.now() style), consistent with existing tables

## Resources

- [Convex Schema Docs](https://docs.convex.dev/database/schemas)
- Existing schema files: `convex/schema/orders.ts`, `convex/schema/organizations.ts`

## Definition of Done

- [ ] File exists at `convex/schema/subscriptions.ts`
- [ ] Exports `subscriptions` table definition
- [ ] All fields, types, and indexes match spec above
- [ ] No TypeScript errors
