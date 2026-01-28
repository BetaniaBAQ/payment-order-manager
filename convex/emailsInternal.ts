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
