# 0005: Limit checking helpers

## Context

Shared helpers called by existing Convex mutations to enforce tier limits before creating orders, profiles, or members. Default to `free` tier if no subscription record exists.

## Dependencies

- 0003 (schema registered + codegen)
- 0004 (TIER_LIMITS constants)

## File

`convex/lib/checkLimits.ts` (new)

## Requirements

5 functions, all take `(ctx: MutationCtx, organizationId: Id<'organizations'>)`:

**getSubscription** — query `subscriptions` by `by_organization` index, return record or null

**checkOrderLimit** — get sub, compare `ordersUsedThisMonth` vs `TIER_LIMITS[tier].orders`. Return `{ allowed: boolean, remaining: number, limit: number, tier: Tier }`

**checkProfileLimit** — get sub, count profiles via `paymentOrderProfiles.by_organization` index, compare vs `TIER_LIMITS[tier].profiles`. Same return shape.

**checkMemberLimit** — get sub, count members via `organizationMemberships.by_organization` index, compare vs `TIER_LIMITS[tier].users`. Handle `Infinity` in remaining calc.

**incrementOrderUsage** — get sub, `ctx.db.patch(sub._id, { ordersUsedThisMonth: +1, updatedAt: Date.now() })`. No-op if no sub record.

All default to `free` tier when subscription is null.

## Resources

- Existing index names: check `convex/schema/profiles.ts` for `by_organization`, `convex/schema/organizationMemberships.ts` for `by_organization`
- [Convex Mutations](https://docs.convex.dev/functions/mutations)

## Definition of Done

- [ ] File exists at `convex/lib/checkLimits.ts`
- [ ] All 5 functions exported
- [ ] Uses correct index names from existing schema
- [ ] Defaults to free tier when no subscription
- [ ] TypeScript compiles without errors
- [ ] `incrementOrderUsage` is a no-op when no subscription exists
