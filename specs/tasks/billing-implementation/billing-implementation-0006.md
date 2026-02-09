# 0006: Enforce order limit in paymentOrders.create

## Context

Add tier-based order creation limit to existing mutation. Profile already has `organizationId` field. Existing mutation is at `convex/paymentOrders.ts`, `create` export (~line 54-154).

## Dependencies

- 0005 (checkOrderLimit, incrementOrderUsage)

## File

`convex/paymentOrders.ts` (modify)

## Requirements

1. Import `checkOrderLimit`, `incrementOrderUsage` from `./lib/checkLimits`
2. After access check (user verified, profile exists) and before `ctx.db.insert('paymentOrders', ...)`:
   ```typescript
   const orderLimit = await checkOrderLimit(ctx, profile.organizationId)
   if (!orderLimit.allowed) {
     throw new ConvexError({
       code: 'LIMIT_REACHED',
       message: `Plan ${orderLimit.tier} limit: ${orderLimit.limit} orders/month`,
       tier: orderLimit.tier,
       limit: orderLimit.limit,
     })
   }
   ```
3. After successful insert (after `ctx.db.insert`):
   ```typescript
   await incrementOrderUsage(ctx, profile.organizationId)
   ```

- `profile` variable already exists in mutation (fetched via `ctx.db.get(args.profileId)`)
- Use `ConvexError` (already imported in the file for other errors)
- Error code `LIMIT_REACHED` — frontend will use this to show upgrade modal

## Resources

- Existing mutation: `convex/paymentOrders.ts` lines 54-154

## Definition of Done

- [ ] Limit check runs before order creation
- [ ] Usage incremented after successful creation
- [ ] Throws `ConvexError` with `code: 'LIMIT_REACHED'` when over limit
- [ ] Error includes `tier` and `limit` fields for frontend
- [ ] Existing tests (if any) still pass
- [ ] Free tier orgs blocked after 10 orders/month
