import type { PaymentOrderStatus } from 'convex/schema'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const STATUS_OPTIONS: Array<{ value: PaymentOrderStatus; label: string }> = [
  { value: 'CREATED', label: 'Created' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'NEEDS_SUPPORT', label: 'Needs Support' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PAID', label: 'Paid' },
  { value: 'RECONCILED', label: 'Reconciled' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

interface StatusFilterProps {
  value: PaymentOrderStatus | undefined
  onChange: (value: PaymentOrderStatus | undefined) => void
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <Select
      value={value ?? ''}
      onValueChange={(v) => onChange(v ? (v as PaymentOrderStatus) : undefined)}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
