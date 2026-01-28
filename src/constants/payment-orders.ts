import type { PaymentOrderStatus } from 'convex/schema'

export const CURRENCIES = [
  { value: 'COP', label: 'COP' },
  { value: 'USD', label: 'USD' },
] as const

export const STATUS_CONFIG: Record<
  PaymentOrderStatus,
  {
    label: string
    bgColor: string
    textColor: string
    dotColor: string
  }
> = {
  CREATED: {
    label: 'Created',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-300',
    dotColor: 'bg-slate-500',
  },
  IN_REVIEW: {
    label: 'In Review',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    textColor: 'text-blue-700 dark:text-blue-300',
    dotColor: 'bg-blue-500',
  },
  NEEDS_SUPPORT: {
    label: 'Needs Support',
    bgColor: 'bg-amber-100 dark:bg-amber-900',
    textColor: 'text-amber-700 dark:text-amber-300',
    dotColor: 'bg-amber-500',
  },
  APPROVED: {
    label: 'Approved',
    bgColor: 'bg-green-100 dark:bg-green-900',
    textColor: 'text-green-700 dark:text-green-300',
    dotColor: 'bg-green-500',
  },
  PAID: {
    label: 'Paid',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  RECONCILED: {
    label: 'Reconciled',
    bgColor: 'bg-purple-100 dark:bg-purple-900',
    textColor: 'text-purple-700 dark:text-purple-300',
    dotColor: 'bg-purple-500',
  },
  REJECTED: {
    label: 'Rejected',
    bgColor: 'bg-red-100 dark:bg-red-900',
    textColor: 'text-red-700 dark:text-red-300',
    dotColor: 'bg-red-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-500 dark:text-gray-400',
    dotColor: 'bg-gray-400',
  },
} as const
