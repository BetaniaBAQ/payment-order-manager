import type { Id } from 'convex/_generated/dataModel'
import type { HistoryAction, PaymentOrderStatus } from 'convex/schema'

import { STATUS_CONFIG } from '@/constants/payment-orders'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface HistoryEntry {
  _id: Id<'paymentOrderHistory'>
  action: HistoryAction
  previousStatus?: PaymentOrderStatus
  newStatus?: PaymentOrderStatus
  comment?: string
  createdAt: number
  user: {
    _id: Id<'users'>
    name: string
    email: string
    avatarUrl?: string
  } | null
}

interface OrderTimelineProps {
  history: Array<HistoryEntry>
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

function getActionDescription(entry: HistoryEntry): string {
  switch (entry.action) {
    case 'CREATED':
      return 'created this order'
    case 'STATUS_CHANGED':
      if (entry.previousStatus && entry.newStatus) {
        const from = STATUS_CONFIG[entry.previousStatus].label
        const to = STATUS_CONFIG[entry.newStatus].label
        return `changed status from ${from} to ${to}`
      }
      return 'changed the status'
    case 'DOCUMENT_ADDED':
      return 'added a document'
    case 'DOCUMENT_REMOVED':
      return 'removed a document'
    case 'UPDATED':
      return 'updated the order'
    case 'COMMENT_ADDED':
      return 'added a comment'
    default:
      return 'performed an action'
  }
}

export function OrderTimeline({ history }: OrderTimelineProps) {
  if (history.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>History of changes to this order</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div key={entry._id} className="flex gap-3">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={entry.user?.avatarUrl}
                    alt={entry.user?.name ?? 'User'}
                  />
                  <AvatarFallback className="text-xs">
                    {entry.user ? getInitials(entry.user.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                {index < history.length - 1 && (
                  <div className="bg-border mt-2 w-px flex-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <p className="text-sm">
                  <span className="font-medium">
                    {entry.user?.name ?? 'Unknown user'}
                  </span>{' '}
                  {getActionDescription(entry)}
                </p>
                {entry.comment && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    "{entry.comment}"
                  </p>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatDate(entry.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
