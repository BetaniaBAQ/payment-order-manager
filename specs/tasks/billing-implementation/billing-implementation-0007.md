# 0007: Enforce profile limit in paymentOrderProfiles.create

## Context

Add tier-based profile creation limit. Existing mutation at `convex/paymentOrderProfiles.ts`, `create` export. Only org admins/owners can create profiles.

## Dependencies

- 0005 (checkProfileLimit)

## File

`convex/paymentOrderProfiles.ts` (modify)

## Requirements

1. Import `checkProfileLimit` from `./lib/checkLimits`
2. Before `ctx.db.insert('paymentOrderProfiles', ...)`:
   ```typescript
   const profileLimit = await checkProfileLimit(ctx, args.organizationId)
   if (!profileLimit.allowed) {
     throw new ConvexError({
       code: 'LIMIT_REACHED',
       message: `Plan ${profileLimit.tier} limit: ${profileLimit.limit} profiles`,
       tier: profileLimit.tier,
       limit: profileLimit.limit,
     })
   }
   ```

- Free tier: 1 profile, Pro: 10, Enterprise: unlimited
- `args.organizationId` already available as mutation arg

## Resources

- Existing mutation: `convex/paymentOrderProfiles.ts`

## Definition of Done

- [ ] Limit check runs before profile creation
- [ ] Throws `ConvexError` with `code: 'LIMIT_REACHED'`
- [ ] Free tier orgs blocked after 1 profile
