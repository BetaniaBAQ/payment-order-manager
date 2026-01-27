import type { PaymentOrderStatus } from 'convex/schema'

export const CURRENCIES = [
  { value: 'COP', label: 'COP' },
  { value: 'USD', label: 'USD' },
] as const

export const STATUS_CONFIG: Record<
  PaymentOrderStatus,
  {
    label: string
    variant: 'default' | 'secondary' | 'outline' | 'destructive'
  }
> = {
  CREATED: { label: 'Created', variant: 'outline' },
  IN_REVIEW: { label: 'In Review', variant: 'secondary' },
  NEEDS_SUPPORT: { label: 'Needs Support', variant: 'destructive' },
  APPROVED: { label: 'Approved', variant: 'default' },
  PAID: { label: 'Paid', variant: 'default' },
  RECONCILED: { label: 'Reconciled', variant: 'default' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', variant: 'outline' },
} as const
