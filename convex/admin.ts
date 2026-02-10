import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { assertSuperAdmin, isSuperAdmin } from './lib/admin'

export const checkIsSuperAdmin = query({
  args: {
    authKitId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user || user.deletedAt) return false

    return isSuperAdmin(user.email)
  },
})

export const listOrganizationsWithSubscriptions = query({
  args: {
    authKitId: v.string(),
  },
  handler: async (ctx, args) => {
    await assertSuperAdmin(ctx, args.authKitId)

    const orgs = await ctx.db.query('organizations').collect()

    const results = await Promise.all(
      orgs.map(async (org) => {
        const sub = await ctx.db
          .query('subscriptions')
          .withIndex('by_organization', (q) => q.eq('organizationId', org._id))
          .first()

        return {
          _id: org._id,
          name: org.name,
          slug: org.slug,
          tier: sub?.tier ?? 'free',
          status: sub?.status ?? 'active',
          paymentProvider: sub?.paymentProvider ?? 'none',
        }
      }),
    )

    return results
  },
})

const FAR_FUTURE_MS = new Date('2099-12-31T23:59:59Z').getTime()

export const assignTier = mutation({
  args: {
    authKitId: v.string(),
    organizationId: v.id('organizations'),
    tier: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')),
  },
  handler: async (ctx, args) => {
    await assertSuperAdmin(ctx, args.authKitId)

    const existingSub = await ctx.db
      .query('subscriptions')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .first()

    const now = Date.now()

    // Setting to free: remove subscription row (org falls back to free defaults)
    if (args.tier === 'free') {
      if (existingSub) {
        await ctx.db.delete('subscriptions', existingSub._id)
      }
      return
    }

    // Update existing subscription
    if (existingSub) {
      await ctx.db.patch('subscriptions', existingSub._id, {
        tier: args.tier,
        paymentProvider: 'physical_contract',
        status: 'active',
        updatedAt: now,
      })
      return
    }

    // Create new subscription
    await ctx.db.insert('subscriptions', {
      organizationId: args.organizationId,
      tier: args.tier,
      billingInterval: 'monthly',
      paymentProvider: 'physical_contract',
      status: 'active',
      currency: 'COP',
      amountPerPeriod: 0,
      currentPeriodStart: now,
      currentPeriodEnd: FAR_FUTURE_MS,
      ordersUsedThisMonth: 0,
      storageUsedBytes: 0,
      emailsSentThisMonth: 0,
      createdAt: now,
      updatedAt: now,
    })
  },
})
