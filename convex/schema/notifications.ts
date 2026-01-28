import { v } from 'convex/values'

import { PaymentOrderStatus } from './status'

// All notification types
export const NotificationType = {
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_APPROVED: 'ORDER_APPROVED',
  ORDER_REJECTED: 'ORDER_REJECTED',
  ORDER_NEEDS_SUPPORT: 'ORDER_NEEDS_SUPPORT',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  DOCUMENT_ADDED: 'DOCUMENT_ADDED',
} as const

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType]

// Validator for Convex args
export const notificationTypeValidator = v.union(
  v.literal('ORDER_CREATED'),
  v.literal('ORDER_APPROVED'),
  v.literal('ORDER_REJECTED'),
  v.literal('ORDER_NEEDS_SUPPORT'),
  v.literal('ORDER_CANCELLED'),
  v.literal('DOCUMENT_ADDED'),
)

// Subset of notification types triggered by status changes
export type StatusChangeNotificationType =
  | 'ORDER_APPROVED'
  | 'ORDER_REJECTED'
  | 'ORDER_NEEDS_SUPPORT'
  | 'ORDER_CANCELLED'

// Map payment order status to notification type (for status change notifications)
export const STATUS_TO_NOTIFICATION = {
  [PaymentOrderStatus.APPROVED]: 'ORDER_APPROVED',
  [PaymentOrderStatus.REJECTED]: 'ORDER_REJECTED',
  [PaymentOrderStatus.NEEDS_SUPPORT]: 'ORDER_NEEDS_SUPPORT',
  [PaymentOrderStatus.CANCELLED]: 'ORDER_CANCELLED',
} as const satisfies Partial<
  Record<PaymentOrderStatus, StatusChangeNotificationType>
>
