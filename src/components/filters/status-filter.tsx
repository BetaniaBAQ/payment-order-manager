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

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
  value: value as PaymentOrderStatus,
  label: config.label,
  dotColor: config.dotColor,
}))

function StatusDot({ className }: { className: string }) {
  return <span className={cn('size-2 shrink-0 rounded-full', className)} />
}

interface StatusFilterProps {
  value: PaymentOrderStatus | undefined
  onChange: (value: PaymentOrderStatus | undefined) => void
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  const selectedOption = value
    ? STATUS_OPTIONS.find((o) => o.value === value)
    : null

  return (
    <Select
      key={value ?? 'empty'}
      value={value ?? ''}
      onValueChange={(v) => onChange(v ? (v as PaymentOrderStatus) : undefined)}
    >
      <SelectTrigger className="w-[160px]">
        {selectedOption ? (
          <span className="flex items-center gap-2">
            <StatusDot className={selectedOption.dotColor} />
            <span>{selectedOption.label}</span>
          </span>
        ) : (
          <SelectValue placeholder="Status" />
        )}
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              <StatusDot className={option.dotColor} />
              <span>{option.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
