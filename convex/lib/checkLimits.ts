import { TIER_LIMITS } from './tierLimits'
import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import type { Tier } from './tierLimits'

export async function getSubscription(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
) {
  return ctx.db
    .query('subscriptions')
    .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
    .unique()
}

export async function checkOrderLimit(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
) {
  const sub = await getSubscription(ctx, organizationId)
  const tier: Tier = sub?.tier ?? 'free'
  const limits = TIER_LIMITS[tier]
  const used = sub?.ordersUsedThisMonth ?? 0

  return {
    allowed: used < limits.orders,
    remaining: Math.max(0, limits.orders - used),
    limit: limits.orders,
    tier,
  }
}

export async function checkProfileLimit(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
) {
  const sub = await getSubscription(ctx, organizationId)
  const tier: Tier = sub?.tier ?? 'free'
  const limits = TIER_LIMITS[tier]

  const profiles = await ctx.db
    .query('paymentOrderProfiles')
    .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
    .collect()

  return {
    allowed: profiles.length < limits.profiles,
    remaining: Math.max(0, limits.profiles - profiles.length),
    limit: limits.profiles,
    tier,
  }
}

export async function checkMemberLimit(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
) {
  const sub = await getSubscription(ctx, organizationId)
  const tier: Tier = sub?.tier ?? 'free'
  const limits = TIER_LIMITS[tier]

  const members = await ctx.db
    .query('organizationMemberships')
    .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
    .collect()

  return {
    allowed: members.length < limits.users,
    remaining:
      limits.users === Infinity
        ? Infinity
        : Math.max(0, limits.users - members.length),
    limit: limits.users,
    tier,
  }
}

export async function incrementOrderUsage(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
) {
  const sub = await getSubscription(ctx, organizationId)
  if (!sub) return
  await ctx.db.patch('subscriptions', sub._id, {
    ordersUsedThisMonth: sub.ordersUsedThisMonth + 1,
    updatedAt: Date.now(),
  })
}
