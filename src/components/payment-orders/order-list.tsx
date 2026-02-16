import { Receipt } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { OrderCard } from './order-card'
import type { Id } from 'convex/_generated/dataModel'
import type { PaymentOrderStatus } from 'convex/schema'


import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'


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
  isLoading?: boolean
}

function OrderListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="mb-3 flex items-start justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="mb-2 h-6 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

export function OrderList({
  orders,
  slug,
  profileSlug,
  isLoading,
}: OrderListProps) {
  const { t } = useTranslation('common')

  if (isLoading && orders.length === 0) {
    return <OrderListSkeleton />
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title={t('empty.paymentOrders.title')}
        description={t('empty.paymentOrders.description')}
      />
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="bg-background/50 animate-in fade-in absolute inset-0 z-10 flex items-center justify-center duration-150">
          <Spinner className="size-6" />
        </div>
      )}
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
    </div>
  )
}
