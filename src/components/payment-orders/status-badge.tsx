import { useTranslation } from 'react-i18next'
import type { PaymentOrderStatus } from 'convex/schema'

import { STATUS_CONFIG } from '@/constants/payment-orders'

import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: PaymentOrderStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation('orders')
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
      {t(config.labelKey)}
    </span>
  )
}
