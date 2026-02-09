# 0003: Register new tables in schema index

## Context

Convex schema uses a central index file that exports all table definitions. New tables must be registered here for codegen to pick them up.

## Dependencies

- 0001, 0002

## File

`convex/schema/index.ts` (modify)

## Requirements

Add to existing exports:

```typescript
export { subscriptions } from './subscriptions'
export { paymentEvents } from './paymentEvents'
```

After modifying, run:

```bash
pnpm convex:codegen
```

This generates types in `convex/_generated/` that other tasks depend on.

## Resources

- Existing file: `convex/schema/index.ts` — see current export pattern

## Definition of Done

- [ ] Both tables exported from `convex/schema/index.ts`
- [ ] `pnpm convex:codegen` runs without errors
- [ ] Generated types include `subscriptions` and `paymentEvents` tables
- [ ] `ctx.db.query('subscriptions')` and `ctx.db.query('paymentEvents')` resolve in IDE
