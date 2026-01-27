import type { PaymentOrderStatus } from 'convex/schema'

import { STATUS_CONFIG } from '@/constants/payment-orders'

import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: PaymentOrderStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return <Badge variant={config.variant}>{config.label}</Badge>
}
