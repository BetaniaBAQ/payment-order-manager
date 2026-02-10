import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { TIER_LIMITS } from './lib/tierLimits'
import type { Id } from './_generated/dataModel'
import type { Tier } from './lib/tierLimits'

// --- Queries ---

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

// --- Stripe status → internal status mapping ---

const STRIPE_STATUS_MAP: Record<string, string> = {
  active: 'active',
  past_due: 'past_due',
  canceled: 'cancelled',
  unpaid: 'past_due',
}

// --- Helper: find subscription by Stripe subscription ID ---

function findByStripeSubscriptionId(
  ctx: { db: any },
  stripeSubscriptionId: string,
) {
  return ctx.db
    .query('subscriptions')
    .withIndex('by_provider_customer', (q: any) =>
      q.eq('paymentProvider', 'stripe'),
    )
    .filter((q: any) =>
      q.eq(q.field('providerSubscriptionId'), stripeSubscriptionId),
    )
    .unique()
}

// --- Webhook Mutations ---

export const handleWompiEvent = mutation({
  args: {
    reference: v.string(),
    status: v.string(),
    transactionId: v.string(),
    paymentMethod: v.string(),
    amountInCents: v.number(),
  },
  handler: async (ctx, args) => {
    // Idempotency: check if event already processed
    const existing = await ctx.db
      .query('paymentEvents')
      .withIndex('by_provider_event', (q) =>
        q.eq('provider', 'wompi').eq('providerEventId', args.transactionId),
      )
      .unique()
    if (existing) return

    // Parse reference: "sub_{orgId}_{tier}_{timestamp}"
    const parts = args.reference.split('_')
    if (parts.length < 4) {
      console.warn('Malformed Wompi reference:', args.reference)
      return
    }
    const organizationId = parts[1] as Id<'organizations'>
    const tier = parts[2] as Tier

    const sub = await ctx.db
      .query('subscriptions')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', organizationId),
      )
      .unique()

    const now = Date.now()
    const thirtyDays = 30 * 24 * 60 * 60 * 1000

    if (args.status === 'APPROVED') {
      if (sub) {
        await ctx.db.patch('subscriptions', sub._id, {
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: now + thirtyDays,
          updatedAt: now,
        })
      } else {
        await ctx.db.insert('subscriptions', {
          organizationId,
          tier,
          billingInterval: 'monthly',
          paymentProvider: 'wompi',
          status: 'active',
          currency: 'COP',
          amountPerPeriod: args.amountInCents,
          currentPeriodStart: now,
          currentPeriodEnd: now + thirtyDays,
          ordersUsedThisMonth: 0,
          storageUsedBytes: 0,
          emailsSentThisMonth: 0,
          createdAt: now,
          updatedAt: now,
        })
      }
    }

    if (args.status === 'DECLINED' || args.status === 'ERROR') {
      if (sub) {
        await ctx.db.patch('subscriptions', sub._id, {
          status: 'past_due',
          updatedAt: now,
        })
      }
    }

    // Log event
    const subscriptionId = sub?._id
    await ctx.db.insert('paymentEvents', {
      subscriptionId: subscriptionId ?? ('' as Id<'subscriptions'>),
      provider: 'wompi',
      eventType: `payment.${args.status.toLowerCase()}`,
      providerEventId: args.transactionId,
      amount: args.amountInCents,
      currency: 'COP',
      paymentMethod: args.paymentMethod,
      createdAt: now,
    })
  },
})

export const handleStripeCheckout = mutation({
  args: {
    sessionId: v.string(),
    customerId: v.string(),
    subscriptionId: v.string(),
    organizationId: v.string(),
    tier: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = args.organizationId as Id<'organizations'>
    const tier = args.tier as Tier
    const now = Date.now()
    const thirtyDays = 30 * 24 * 60 * 60 * 1000

    const existing = await ctx.db
      .query('subscriptions')
      .withIndex('by_organization', (q) => q.eq('organizationId', orgId))
      .unique()

    if (existing) {
      await ctx.db.patch('subscriptions', existing._id, {
        tier,
        paymentProvider: 'stripe',
        providerCustomerId: args.customerId,
        providerSubscriptionId: args.subscriptionId,
        status: 'active',
        updatedAt: now,
      })
    } else {
      await ctx.db.insert('subscriptions', {
        organizationId: orgId,
        tier,
        billingInterval: 'monthly',
        paymentProvider: 'stripe',
        providerCustomerId: args.customerId,
        providerSubscriptionId: args.subscriptionId,
        status: 'active',
        currency: 'USD',
        amountPerPeriod: 0, // Stripe manages pricing
        currentPeriodStart: now,
        currentPeriodEnd: now + thirtyDays,
        ordersUsedThisMonth: 0,
        storageUsedBytes: 0,
        emailsSentThisMonth: 0,
        createdAt: now,
        updatedAt: now,
      })
    }
  },
})

export const handleStripeSubscriptionUpdate = mutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const sub = await findByStripeSubscriptionId(ctx, args.stripeSubscriptionId)
    if (!sub) return

    const mappedStatus = (STRIPE_STATUS_MAP[args.status] ?? 'active') as
      | 'active'
      | 'past_due'
      | 'cancelled'
      | 'pending_payment'

    await ctx.db.patch('subscriptions', sub._id, {
      status: mappedStatus,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      updatedAt: Date.now(),
    })
  },
})

export const handleStripeSubscriptionDeleted = mutation({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    const sub = await findByStripeSubscriptionId(ctx, args.stripeSubscriptionId)
    if (!sub) return

    await ctx.db.patch('subscriptions', sub._id, {
      tier: 'free',
      status: 'cancelled',
      cancelledAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

export const handlePaymentFailed = mutation({
  args: {
    stripeSubscriptionId: v.optional(v.string()),
    wompiReference: v.optional(v.string()),
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    let sub = null

    if (args.provider === 'stripe' && args.stripeSubscriptionId) {
      sub = await findByStripeSubscriptionId(ctx, args.stripeSubscriptionId)
    }

    if (args.provider === 'wompi' && args.wompiReference) {
      const parts = args.wompiReference.split('_')
      if (parts.length >= 2) {
        const organizationId = parts[1] as Id<'organizations'>
        sub = await ctx.db
          .query('subscriptions')
          .withIndex('by_organization', (q) =>
            q.eq('organizationId', organizationId),
          )
          .unique()
      }
    }

    if (!sub) return

    await ctx.db.patch('subscriptions', sub._id, {
      status: 'past_due',
      updatedAt: Date.now(),
    })

    // TODO: Schedule payment failed email once 0023 is implemented
    console.log('Payment failed for subscription:', sub._id)
  },
})
