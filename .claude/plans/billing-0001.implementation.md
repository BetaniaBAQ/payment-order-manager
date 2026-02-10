# 0001: Subscriptions table schema

## Summary

Create `convex/schema/subscriptions.ts` with the provider-agnostic subscription table definition. Follow existing schema patterns (one export per file, `defineTable` + `v` validators, indexes).

## Changes

### New file: `convex/schema/subscriptions.ts`

- Export `subscriptions` table via `defineTable()`
- Fields: `organizationId`, `tier`, `billingInterval`, `paymentProvider`, provider IDs (optional), `status`, `currency`, `amountPerPeriod`, period timestamps, usage counters, timestamps, `cancelledAt`
- Indexes: `by_organization`, `by_provider_customer`, `by_status`

### Note: NOT registering in `convex/schema.ts` yet

Task 0003 handles registration in schema index + codegen. This task only creates the file.

## Files

| File                             | Action |
| -------------------------------- | ------ |
| `convex/schema/subscriptions.ts` | Create |
