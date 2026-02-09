# 0020: Cron - reset monthly usage

## Context

Monthly cron that resets usage counters (ordersUsedThisMonth, emailsSentThisMonth) for all active subscriptions on the 1st of each month. storageUsedBytes is NOT reset (cumulative).

## Dependencies

- 0009 (convex/subscriptions.ts exists)

## Files

- `convex/crons.ts` (new)
- `convex/subscriptions.ts` (add internalMutation)

## Requirements

**crons.ts:**

```typescript
import { cronJobs } from 'convex/server'

import { internal } from './_generated/api'

const crons = cronJobs()
crons.monthly(
  'reset usage counters',
  { day: 1, hourUTC: 5, minuteUTC: 0 },
  internal.subscriptions.resetMonthlyUsage,
)
export default crons
```

05:00 UTC = 00:00 COT (Colombia Time)

**subscriptions.ts — add:**

```typescript
export const resetMonthlyUsage = internalMutation({
  handler: async (ctx) => {
    const activeSubs = await ctx.db
      .query('subscriptions')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect()
    for (const sub of activeSubs) {
      await ctx.db.patch(sub._id, {
        ordersUsedThisMonth: 0,
        emailsSentThisMonth: 0,
        updatedAt: Date.now(),
      })
    }
  },
})
```

- Only resets `ordersUsedThisMonth` and `emailsSentThisMonth`
- `storageUsedBytes` persists (not monthly)
- Uses `internalMutation` (not callable from client)

## Resources

- [Convex Cron Jobs](https://docs.convex.dev/scheduling/cron-jobs)

## Definition of Done

- [ ] `convex/crons.ts` exists with default export
- [ ] `resetMonthlyUsage` internalMutation in subscriptions.ts
- [ ] Only active subscriptions reset
- [ ] storageUsedBytes NOT touched
- [ ] Runs 1st of month at 00:00 COT
