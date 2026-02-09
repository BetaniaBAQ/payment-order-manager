# 0009: Subscription query - getByOrganization

## Context

Foundation file for `convex/subscriptions.ts`. Returns subscription + computed usage data for an organization. All subsequent mutation tasks (0015-0022) add to this file.

## Dependencies

- 0003 (schema codegen)
- 0004 (TIER_LIMITS)

## File

`convex/subscriptions.ts` (new)

## Requirements

```typescript
import { v } from 'convex/values'

import { internalMutation, mutation, query } from './_generated/server'
import { TIER_LIMITS, type Tier } from './lib/tierLimits'

export const getByOrganization = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query('subscriptions')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .unique()

    const tier: Tier = sub?.tier ?? 'free'
    const limits = TIER_LIMITS[tier]

    return {
      subscription: sub,
      tier,
      limits,
      usage: {
        orders: sub?.ordersUsedThisMonth ?? 0,
        storageMB: Math.round((sub?.storageUsedBytes ?? 0) / 1024 / 1024),
        emails: sub?.emailsSentThisMonth ?? 0,
      },
    }
  },
})
```

- Returns `null` subscription + free tier defaults when no record exists
- `usage.storageMB` rounds bytes to MB for display
- This query will be called by UI components (billing settings, usage meters, limit banner)

## Resources

- Existing query pattern: `convex/organizations.ts` `getBySlug`
- [Convex Queries](https://docs.convex.dev/functions/queries)

## Definition of Done

- [ ] File exists at `convex/subscriptions.ts`
- [ ] `getByOrganization` query exported
- [ ] Returns correct defaults for orgs without subscription record
- [ ] Callable from frontend: `useQuery(api.subscriptions.getByOrganization, { organizationId })`
- [ ] No TypeScript errors
