import { v } from 'convex/values'

// Payment order status
export const PaymentOrderStatus = {
  CREATED: 'CREATED',
  IN_REVIEW: 'IN_REVIEW',
  NEEDS_SUPPORT: 'NEEDS_SUPPORT',
  APPROVED: 'APPROVED',
  PAID: 'PAID',
  RECONCILED: 'RECONCILED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const

export type PaymentOrderStatus =
  (typeof PaymentOrderStatus)[keyof typeof PaymentOrderStatus]

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
export const HistoryAction = {
  CREATED: 'CREATED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  DOCUMENT_ADDED: 'DOCUMENT_ADDED',
  DOCUMENT_REMOVED: 'DOCUMENT_REMOVED',
  UPDATED: 'UPDATED',
  COMMENT_ADDED: 'COMMENT_ADDED',
} as const

export type HistoryAction = (typeof HistoryAction)[keyof typeof HistoryAction]

export const historyActionValidator = v.union(
  v.literal('CREATED'),
  v.literal('STATUS_CHANGED'),
  v.literal('DOCUMENT_ADDED'),
  v.literal('DOCUMENT_REMOVED'),
  v.literal('UPDATED'),
  v.literal('COMMENT_ADDED'),
)

// Valid state transitions for payment orders
export const VALID_TRANSITIONS: Record<
  PaymentOrderStatus,
  Array<PaymentOrderStatus>
> = {
  CREATED: ['IN_REVIEW', 'CANCELLED'],
  IN_REVIEW: ['APPROVED', 'REJECTED', 'NEEDS_SUPPORT', 'CANCELLED'],
  NEEDS_SUPPORT: ['IN_REVIEW', 'CANCELLED'],
  APPROVED: ['PAID'],
  PAID: ['RECONCILED'],
  REJECTED: [],
  RECONCILED: [],
  CANCELLED: [],
}
