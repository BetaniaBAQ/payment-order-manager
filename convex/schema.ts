import { defineSchema } from 'convex/server'

import { paymentOrderDocuments } from './schema/documents'
import { paymentOrderHistory } from './schema/history'
import { paymentOrders } from './schema/orders'
import { organizations } from './schema/organizations'
import { paymentOrderProfiles } from './schema/profiles'
import { tags } from './schema/tags'
import { users } from './schema/users'

// Re-export enums and types for convenience
export {
  PaymentOrderStatus,
  HistoryAction,
  type PaymentOrderStatus as PaymentOrderStatusType,
  type HistoryAction as HistoryActionType,
} from './schema/status'

export default defineSchema({
  users,
  organizations,
  paymentOrderProfiles,
  tags,
  paymentOrders,
  paymentOrderDocuments,
  paymentOrderHistory,
})
