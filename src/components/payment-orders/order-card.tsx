import { Link } from '@tanstack/react-router'

import { StatusBadge } from './status-badge'
import type { Id } from 'convex/_generated/dataModel'
import type { PaymentOrderStatus } from 'convex/schema'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'
import { formatCurrency, formatDate, useLocale } from '@/lib/format'


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
  slug: string
  profileSlug: string
}

export function OrderCard({ order, slug, profileSlug }: OrderCardProps) {
  const locale = useLocale()

  return (
    <Link
      to={ROUTES.order}
      params={{ slug, profileSlug, orderId: order._id }}
      className="block transition-opacity hover:opacity-80"
    >
      <Card className="cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-medium">
              {order.title}
            </CardTitle>
            <StatusBadge status={order.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-lg font-semibold">
                {formatCurrency(order.amount, order.currency, locale)}
              </p>
              <p className="text-muted-foreground text-sm">
                {formatDate(order.createdAt, locale)}
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
    </Link>
  )
}
