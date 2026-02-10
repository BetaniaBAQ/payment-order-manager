import { useTranslation } from 'react-i18next'
import type { PaymentOrderStatus } from 'convex/schema'

import { STATUS_CONFIG } from '@/constants/payment-orders'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const STATUS_KEYS = Object.keys(STATUS_CONFIG) as Array<PaymentOrderStatus>

function StatusDot({ className }: { className: string }) {
  return <span className={cn('size-2 shrink-0 rounded-full', className)} />
}

interface StatusFilterProps {
  value: PaymentOrderStatus | undefined
  onChange: (value: PaymentOrderStatus | undefined) => void
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  const { t } = useTranslation('orders')
  const selectedConfig = value ? STATUS_CONFIG[value] : null

  return (
    <Select
      key={value ?? 'empty'}
      value={value ?? ''}
      onValueChange={(v) => onChange(v ? (v as PaymentOrderStatus) : undefined)}
    >
      <SelectTrigger>
        {selectedConfig ? (
          <span className="flex items-center gap-2">
            <StatusDot className={selectedConfig.dotColor} />
            <span>{t(selectedConfig.labelKey)}</span>
          </span>
        ) : (
          <SelectValue placeholder={t('filters.status')} />
        )}
      </SelectTrigger>
      <SelectContent>
        {STATUS_KEYS.map((status) => {
          const config = STATUS_CONFIG[status]
          return (
            <SelectItem key={status} value={status}>
              <span className="flex items-center gap-2">
                <StatusDot className={config.dotColor} />
                <span>{t(config.labelKey)}</span>
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
