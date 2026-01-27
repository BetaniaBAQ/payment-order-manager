import { defineTable } from 'convex/server'
import { v } from 'convex/values'

import { paymentOrderStatusValidator } from './status'

export const paymentOrders = defineTable({
  profileId: v.id('paymentOrderProfiles'),
  createdById: v.id('users'),
  title: v.string(),
  description: v.optional(v.string()),
  reason: v.string(),
  amount: v.number(),
  currency: v.string(),
  status: paymentOrderStatusValidator,
  tagId: v.optional(v.id('tags')),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_profile', ['profileId'])
  .index('by_creator', ['createdById'])
  .index('by_status', ['status'])
  .index('by_profile_and_status', ['profileId', 'status'])
  .index('by_tag', ['tagId'])
  .searchIndex('search_orders', {
    searchField: 'title',
    filterFields: ['profileId'],
  })
