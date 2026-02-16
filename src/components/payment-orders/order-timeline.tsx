import { useTranslation } from 'react-i18next'
import type { Id } from 'convex/_generated/dataModel'
import type { HistoryAction, PaymentOrderStatus } from 'convex/schema'


import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatDateTime, useLocale } from '@/lib/format'

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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const ACTION_KEY_MAP: Record<HistoryAction, string> = {
  CREATED: 'timeline.created',
  STATUS_CHANGED: 'timeline.statusChangedGeneric',
  DOCUMENT_ADDED: 'timeline.documentAdded',
  DOCUMENT_REMOVED: 'timeline.documentRemoved',
  UPDATED: 'timeline.updated',
  COMMENT_ADDED: 'timeline.commentAdded',
}

const STATUS_DOT_COLORS: Record<string, string> = {
  CREATED: 'bg-primary',
  IN_REVIEW: 'bg-amber-500',
  APPROVED: 'bg-green-500',
  PAID: 'bg-green-600',
  RECONCILED: 'bg-green-700',
  REJECTED: 'bg-red-500',
  CANCELLED: 'bg-muted-foreground',
  NEEDS_SUPPORT: 'bg-amber-500',
}

function getTimelineDotColor(entry: HistoryEntry): string {
  if (entry.action === 'CREATED') return STATUS_DOT_COLORS.CREATED
  if (entry.newStatus) return STATUS_DOT_COLORS[entry.newStatus] ?? 'bg-primary'
  return 'bg-primary'
}

export function OrderTimeline({ history }: OrderTimelineProps) {
  const { t } = useTranslation('orders')
  const locale = useLocale()

  if (history.length === 0) {
    return null
  }

  function getActionDescription(entry: HistoryEntry): string {
    if (
      entry.action === 'STATUS_CHANGED' &&
      entry.previousStatus &&
      entry.newStatus
    ) {
      return t('timeline.statusChanged', {
        from: t(`status.${entry.previousStatus}`),
        to: t(`status.${entry.newStatus}`),
      })
    }

    return t(ACTION_KEY_MAP[entry.action])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('timeline.title')}</CardTitle>
        <CardDescription>{t('timeline.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div key={entry._id} className="flex gap-3">
              {/* Timeline line + avatar */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={entry.user?.avatarUrl}
                      alt={entry.user?.name ?? 'User'}
                    />
                    <AvatarFallback className="text-xs">
                      {entry.user ? getInitials(entry.user.name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Color-coded dot */}
                  <span
                    className={`absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white dark:border-gray-950 ${getTimelineDotColor(entry)}`}
                  />
                </div>
                {index < history.length - 1 && (
                  <div className="bg-primary/20 mt-2 w-px flex-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <p className="text-sm">
                  <span className="font-medium">
                    {entry.user?.name ?? t('timeline.unknownUser')}
                  </span>{' '}
                  {getActionDescription(entry)}
                </p>
                {entry.comment && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    &ldquo;{entry.comment}&rdquo;
                  </p>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatDateTime(entry.createdAt, locale)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
