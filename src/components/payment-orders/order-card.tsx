import { StatusBadge } from './status-badge'
import type { Id } from 'convex/_generated/dataModel'
import type { PaymentOrderStatus } from 'convex/schema'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


interface OrderCardProps {
  order: {
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
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp))
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-medium">{order.title}</CardTitle>
          <StatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-lg font-semibold">
              {formatCurrency(order.amount, order.currency)}
            </p>
            <p className="text-muted-foreground text-sm">
              {formatDate(order.createdAt)}
            </p>
          </div>
          {order.tag && (
            <Badge
              variant="outline"
              style={{
                borderColor: order.tag.color,
                color: order.tag.color,
              }}
            >
              {order.tag.name}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
