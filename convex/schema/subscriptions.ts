import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const subscriptions = defineTable({
  organizationId: v.id('organizations'),
  tier: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')),
  billingInterval: v.union(v.literal('monthly'), v.literal('annual')),
  paymentProvider: v.union(
    v.literal('wompi'),
    v.literal('stripe'),
    v.literal('none'),
    v.literal('physical_contract'),
  ),
  providerCustomerId: v.optional(v.string()), // Stripe: cus_xxx
  providerSubscriptionId: v.optional(v.string()), // Stripe: sub_xxx
  providerPaymentSourceId: v.optional(v.string()), // Wompi: tokenized card source ID
  status: v.union(
    v.literal('active'),
    v.literal('past_due'),
    v.literal('cancelled'),
    v.literal('pending_payment'),
  ),
  currency: v.string(), // "COP" or "USD"
  amountPerPeriod: v.number(), // smallest unit: centavos COP or cents USD
  currentPeriodStart: v.number(),
  currentPeriodEnd: v.number(),
  ordersUsedThisMonth: v.number(),
  storageUsedBytes: v.number(),
  emailsSentThisMonth: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  cancelledAt: v.optional(v.number()),
})
  .index('by_organization', ['organizationId'])
  .index('by_provider_customer', ['paymentProvider', 'providerCustomerId'])
  .index('by_status', ['status'])
