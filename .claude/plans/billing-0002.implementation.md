# 0002: Payment events table schema

## Summary

Create `convex/schema/paymentEvents.ts` — audit log table for billing events. References `subscriptions` table. Compound index on `(provider, providerEventId)` for idempotency.

## Changes

### New file: `convex/schema/paymentEvents.ts`

- Export `paymentEvents` table via `defineTable()`
- Fields: `subscriptionId` (ref to subscriptions), `provider`, `eventType`, `providerEventId`, `amount`, `currency`, `paymentMethod`, `metadata`, `createdAt`
- Indexes: `by_subscription`, `by_provider_event`

## Files

| File                             | Action |
| -------------------------------- | ------ |
| `convex/schema/paymentEvents.ts` | Create |
