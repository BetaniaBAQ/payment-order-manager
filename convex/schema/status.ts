import { v } from 'convex/values'

// Payment order status
export const paymentOrderStatuses = [
  'CREATED',
  'IN_REVIEW',
  'NEEDS_SUPPORT',
  'APPROVED',
  'PAID',
  'RECONCILED',
  'REJECTED',
  'CANCELLED',
] as const

export type PaymentOrderStatus = (typeof paymentOrderStatuses)[number]

export const paymentOrderStatusValidator = v.union(
  v.literal('CREATED'),
  v.literal('IN_REVIEW'),
  v.literal('NEEDS_SUPPORT'),
  v.literal('APPROVED'),
  v.literal('PAID'),
  v.literal('RECONCILED'),
  v.literal('REJECTED'),
  v.literal('CANCELLED'),
)

// History actions
export const historyActions = [
  'CREATED',
  'STATUS_CHANGED',
  'DOCUMENT_ADDED',
  'DOCUMENT_REMOVED',
  'UPDATED',
  'COMMENT_ADDED',
] as const

export type HistoryAction = (typeof historyActions)[number]

export const historyActionValidator = v.union(
  v.literal('CREATED'),
  v.literal('STATUS_CHANGED'),
  v.literal('DOCUMENT_ADDED'),
  v.literal('DOCUMENT_REMOVED'),
  v.literal('UPDATED'),
  v.literal('COMMENT_ADDED'),
)
