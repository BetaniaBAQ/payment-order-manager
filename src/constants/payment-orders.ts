import type { PaymentOrderStatus } from 'convex/schema'

export const CURRENCIES = [
  { value: 'COP', label: 'COP' },
  { value: 'USD', label: 'USD' },
] as const

export const STATUS_CONFIG: Record<
  PaymentOrderStatus,
  {
    labelKey: string
    bgColor: string
    textColor: string
    dotColor: string
  }
> = {
  CREATED: {
    labelKey: 'status.CREATED',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-300',
    dotColor: 'bg-slate-500',
  },
  IN_REVIEW: {
    labelKey: 'status.IN_REVIEW',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    textColor: 'text-blue-700 dark:text-blue-300',
    dotColor: 'bg-blue-500',
  },
  NEEDS_SUPPORT: {
    labelKey: 'status.NEEDS_SUPPORT',
    bgColor: 'bg-amber-100 dark:bg-amber-900',
    textColor: 'text-amber-700 dark:text-amber-300',
    dotColor: 'bg-amber-500',
  },
  APPROVED: {
    labelKey: 'status.APPROVED',
    bgColor: 'bg-green-100 dark:bg-green-900',
    textColor: 'text-green-700 dark:text-green-300',
    dotColor: 'bg-green-500',
  },
  PAID: {
    labelKey: 'status.PAID',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  RECONCILED: {
    labelKey: 'status.RECONCILED',
    bgColor: 'bg-purple-100 dark:bg-purple-900',
    textColor: 'text-purple-700 dark:text-purple-300',
    dotColor: 'bg-purple-500',
  },
  REJECTED: {
    labelKey: 'status.REJECTED',
    bgColor: 'bg-red-100 dark:bg-red-900',
    textColor: 'text-red-700 dark:text-red-300',
    dotColor: 'bg-red-500',
  },
  CANCELLED: {
    labelKey: 'status.CANCELLED',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-500 dark:text-gray-400',
    dotColor: 'bg-gray-400',
  },
} as const
