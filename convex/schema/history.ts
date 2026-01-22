import { defineTable } from 'convex/server'
import { v } from 'convex/values'

import { historyActionValidator, paymentOrderStatusValidator } from './status'

export const paymentOrderHistory = defineTable({
  paymentOrderId: v.id('paymentOrders'),
  userId: v.id('users'),
  action: historyActionValidator,
  previousStatus: v.optional(paymentOrderStatusValidator),
  newStatus: v.optional(paymentOrderStatusValidator),
  comment: v.optional(v.string()),
  metadata: v.optional(v.any()),
  createdAt: v.number(),
}).index('by_paymentOrder', ['paymentOrderId'])
