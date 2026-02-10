import { v } from 'convex/values'

import { query } from './_generated/server'
import { TIER_LIMITS } from './lib/tierLimits'
import type { Tier } from './lib/tierLimits'

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
