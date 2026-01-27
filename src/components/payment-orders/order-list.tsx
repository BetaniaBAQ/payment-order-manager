import { OrderCard } from './order-card'
import type { Id } from 'convex/_generated/dataModel'
import type { PaymentOrderStatus } from 'convex/schema'

import { EMPTY_STATE } from '@/constants/profile'

import { EmptyState } from '@/components/shared/empty-state'


interface Order {
  _id: Id<'paymentOrders'>
  title: string
  amount: number
  currency: string
  status: PaymentOrderStatus
  createdAt: number
  tag?: {
    _id: Id<'tags'>
    name: string
    color: string
  } | null
}

interface OrderListProps {
  orders: Array<Order>
  slug: string
  profileSlug: string
}

export function OrderList({ orders, slug, profileSlug }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title={EMPTY_STATE.paymentOrders.title}
        description={EMPTY_STATE.paymentOrders.description}
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <OrderCard
          key={order._id}
          order={order}
          slug={slug}
          profileSlug={profileSlug}
        />
      ))}
    </div>
  )
}
