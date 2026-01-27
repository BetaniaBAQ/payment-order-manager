import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const paymentOrderDocuments = defineTable({
  paymentOrderId: v.id('paymentOrders'),
  uploadedById: v.id('users'),
  requirementLabel: v.string(), // matches tag.fileRequirements[].label
  fileName: v.string(),
  fileKey: v.string(),
  fileUrl: v.string(),
  fileType: v.string(),
  fileSize: v.number(),
  createdAt: v.number(),
}).index('by_paymentOrder', ['paymentOrderId'])
