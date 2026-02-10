import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const paymentEvents = defineTable({
  subscriptionId: v.id('subscriptions'),
  provider: v.union(v.literal('wompi'), v.literal('stripe')),
  eventType: v.string(), // "payment.approved", "payment.declined", "subscription.cancelled"
  providerEventId: v.optional(v.string()), // Wompi transactionId or Stripe event ID, for idempotency
  amount: v.optional(v.number()),
  currency: v.optional(v.string()),
  paymentMethod: v.optional(v.string()), // "pse", "nequi", "card", "bancolombia"
  metadata: v.optional(v.any()),
  createdAt: v.number(),
})
  .index('by_subscription', ['subscriptionId'])
  .index('by_provider_event', ['provider', 'providerEventId'])
