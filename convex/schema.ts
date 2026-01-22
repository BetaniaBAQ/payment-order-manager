import { defineSchema } from 'convex/server'

import { users } from './schema/users'
import { organizations } from './schema/organizations'
import { paymentOrderProfiles } from './schema/profiles'
import { tags } from './schema/tags'
import { paymentOrders } from './schema/orders'
import { paymentOrderDocuments } from './schema/documents'
import { paymentOrderHistory } from './schema/history'

// Re-export types for convenience
export {
  type PaymentOrderStatus,
  type HistoryAction,
  paymentOrderStatuses,
  historyActions,
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
