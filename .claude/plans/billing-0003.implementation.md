# 0003: Register tables in schema index + codegen

## Summary

Import and register `subscriptions` and `paymentEvents` in `convex/schema.ts`. Run codegen to generate types.

## Changes

### Modified: `convex/schema.ts`

- Import `subscriptions` from `./schema/subscriptions`
- Import `paymentEvents` from `./schema/paymentEvents`
- Add both to `defineSchema()` call

## Files

| File               | Action |
| ------------------ | ------ |
| `convex/schema.ts` | Modify |
