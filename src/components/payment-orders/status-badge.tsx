import type { PaymentOrderStatus } from 'convex/schema'

import { STATUS_CONFIG } from '@/constants/payment-orders'

import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: PaymentOrderStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bgColor,
        config.textColor,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
