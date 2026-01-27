import type { Id } from 'convex/_generated/dataModel'
import type { PaymentOrderStatus } from 'convex/schema'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface OrderInfoCardProps {
  order: {
    _id: Id<'paymentOrders'>
    title: string
    description?: string
    reason: string
    amount: number
    currency: string
    status: PaymentOrderStatus
    createdAt: number
    updatedAt: number
    creator: {
      _id: Id<'users'>
      name: string
      email: string
      avatarUrl?: string
    } | null
    tag: {
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
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function OrderInfoCard({ order }: OrderInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
        <CardDescription>Information about this payment order</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Amount</span>
          <span className="text-2xl font-bold">
            {formatCurrency(order.amount, order.currency)}
          </span>
        </div>

        {/* Reason */}
        <div className="space-y-1">
          <span className="text-muted-foreground text-sm">Reason</span>
          <p className="text-sm">{order.reason}</p>
        </div>

        {/* Description */}
        {order.description && (
          <div className="space-y-1">
            <span className="text-muted-foreground text-sm">Description</span>
            <p className="text-sm">{order.description}</p>
          </div>
        )}

        {/* Tag */}
        {order.tag && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Tag</span>
            <Badge
              variant="outline"
              style={{
                borderColor: order.tag.color,
                color: order.tag.color,
              }}
            >
              {order.tag.name}
            </Badge>
          </div>
        )}

        {/* Creator */}
        {order.creator && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Created by</span>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={order.creator.avatarUrl}
                  alt={order.creator.name}
                />
                <AvatarFallback className="text-xs">
                  {getInitials(order.creator.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{order.creator.name}</span>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last updated</span>
            <span>{formatDate(order.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
