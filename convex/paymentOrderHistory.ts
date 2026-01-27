import { v } from 'convex/values'

import { query } from './_generated/server'

export const getByPaymentOrder = query({
  args: {
    paymentOrderId: v.id('paymentOrders'),
    authKitId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get order, validate exists
    const order = await ctx.db.get('paymentOrders', args.paymentOrderId)
    if (!order) {
      return []
    }

    // 2. Get user, validate exists
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      return []
    }

    // 3. Get profile for access check
    const profile = await ctx.db.get('paymentOrderProfiles', order.profileId)
    if (!profile) {
      return []
    }

    // 4. Validate access
    const isProfileOwner = user._id === profile.ownerId

    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', profile.organizationId).eq('userId', user._id),
      )
      .first()

    const isOrgMember = !!membership
    const userEmail = user.email.toLowerCase()
    const isWhitelisted = profile.allowedEmails.includes(userEmail)

    if (!isProfileOwner && !isOrgMember && !isWhitelisted) {
      return []
    }

    // Whitelisted users can only see history of their own orders
    if (isWhitelisted && !isProfileOwner && !isOrgMember) {
      if (order.createdById !== user._id) {
        return []
      }
    }

    // 5. Fetch history entries
    const historyEntries = await ctx.db
      .query('paymentOrderHistory')
      .withIndex('by_paymentOrder', (q) =>
        q.eq('paymentOrderId', args.paymentOrderId),
      )
      .collect()

    // 6. Enrich with user data
    const enrichedEntries = await Promise.all(
      historyEntries.map(async (entry) => {
        const entryUser = await ctx.db.get('users', entry.userId)

        return {
          _id: entry._id,
          action: entry.action,
          previousStatus: entry.previousStatus,
          newStatus: entry.newStatus,
          comment: entry.comment,
          metadata: entry.metadata,
          createdAt: entry.createdAt,
          user: entryUser
            ? {
                _id: entryUser._id,
                name: entryUser.name,
                email: entryUser.email,
                avatarUrl: entryUser.avatarUrl,
              }
            : null,
        }
      }),
    )

    // 7. Sort by createdAt ascending (oldest first for timeline)
    return enrichedEntries.sort((a, b) => a.createdAt - b.createdAt)
  },
})
