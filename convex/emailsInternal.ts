import { v } from 'convex/values'
import { vOnEmailEventArgs } from '@convex-dev/resend'

import { internalMutation, internalQuery } from './_generated/server'

export const getData = internalQuery({
  args: { paymentOrderId: v.id('paymentOrders') },
  handler: async (ctx, args) => {
    const order = await ctx.db.get('paymentOrders', args.paymentOrderId)
    if (!order) return null

    const profile = await ctx.db.get('paymentOrderProfiles', order.profileId)
    const creator = await ctx.db.get('users', order.createdById)
    const owner = profile ? await ctx.db.get('users', profile.ownerId) : null
    const org = profile
      ? await ctx.db.get('organizations', profile.organizationId)
      : null

    return { order, profile, creator, owner, org }
  },
})

export const getUser = internalQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get('users', args.userId)
  },
})

export const getBillingData = internalQuery({
  args: { subscriptionId: v.id('subscriptions') },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get('subscriptions', args.subscriptionId)
    if (!sub) return null

    const org = await ctx.db.get('organizations', sub.organizationId)
    if (!org) return null

    // Get org owner email for billing notifications
    const ownerMembership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', sub.organizationId),
      )
      .filter((q) => q.eq(q.field('role'), 'owner'))
      .first()

    const owner = ownerMembership
      ? await ctx.db.get('users', ownerMembership.userId)
      : null

    return { subscription: sub, org, owner }
  },
})

// Handle email delivery events (bounces, complaints, etc.)
export const handleEmailEvent = internalMutation({
  args: vOnEmailEventArgs,
  handler: (_ctx, args) => {
    // Log for now - could store in DB for tracking
    console.log('Email event:', {
      id: args.id,
      type: args.event.type,
    })
  },
})
