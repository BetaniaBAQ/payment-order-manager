# 0008: Enforce member limit in organizationMemberships.addMember

## Context

Add tier-based member limit. Existing mutation at `convex/organizationMemberships.ts`, `addMember` export. Only org admins/owners can add members.

## Dependencies

- 0005 (checkMemberLimit)

## File

`convex/organizationMemberships.ts` (modify)

## Requirements

1. Import `checkMemberLimit` from `./lib/checkLimits`
2. Before `ctx.db.insert('organizationMemberships', ...)`:
   ```typescript
   const memberLimit = await checkMemberLimit(ctx, args.organizationId)
   if (!memberLimit.allowed) {
     throw new ConvexError({
       code: 'LIMIT_REACHED',
       message: `Plan ${memberLimit.tier} limit: ${memberLimit.limit} users`,
       tier: memberLimit.tier,
       limit: memberLimit.limit,
     })
   }
   ```

- Free tier: 3 users, Pro/Enterprise: unlimited
- Skip check if `limits.users === Infinity`

## Resources

- Existing mutation: `convex/organizationMemberships.ts`

## Definition of Done

- [ ] Limit check runs before member addition
- [ ] Throws `ConvexError` with `code: 'LIMIT_REACHED'`
- [ ] Free tier orgs blocked after 3 members
- [ ] Pro/Enterprise never blocked (Infinity)
