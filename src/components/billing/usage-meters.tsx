import { useTranslation } from 'react-i18next'

import type { TierLimits } from '../../../convex/lib/tierLimits'
import { Progress } from '@/components/ui/progress'


type UsageMetersProps = {
  usage: {
    orders: number
    storageMB: number
    emails: number
  }
  limits: TierLimits
}

type MeterConfig = {
  labelKey: string
  used: number
  limit: number
  formatUsed: (n: number) => string
  formatLimit: (n: number, t: (key: string) => string) => string
}

function formatStorage(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb} MB`
}

function getProgressColor(percentage: number): string {
  if (percentage > 80) return 'bg-red-500'
  if (percentage > 60) return 'bg-yellow-500'
  return ''
}

export function UsageMeters({ usage, limits }: UsageMetersProps) {
  const { t } = useTranslation('billing')

  const meters: Array<MeterConfig> = [
    {
      labelKey: 'usage.ordersThisMonth',
      used: usage.orders,
      limit: limits.orders,
      formatUsed: (n) => String(n),
      formatLimit: (n, tr) =>
        n === Infinity ? tr('usage.unlimited') : String(n),
    },
    {
      labelKey: 'usage.storage',
      used: usage.storageMB,
      limit: limits.storageMB,
      formatUsed: formatStorage,
      formatLimit: (n, tr) =>
        n === Infinity ? tr('usage.unlimited') : formatStorage(n),
    },
    {
      labelKey: 'usage.emailsThisMonth',
      used: usage.emails,
      limit: limits.emails,
      formatUsed: (n) => String(n),
      formatLimit: (n, tr) =>
        n === Infinity ? tr('usage.unlimited') : String(n),
    },
  ]

  return (
    <div className="space-y-4">
      {meters.map((meter) => {
        const isUnlimited = meter.limit === Infinity
        const percentage = isUnlimited
          ? 0
          : Math.min((meter.used / meter.limit) * 100, 100)
        const colorClass = getProgressColor(percentage)

        return (
          <div key={meter.labelKey} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>{t(meter.labelKey)}</span>
              <span className="text-muted-foreground">
                {meter.formatUsed(meter.used)} /{' '}
                {meter.formatLimit(meter.limit, t)}
              </span>
            </div>
            {isUnlimited ? (
              <p className="text-muted-foreground text-xs">
                {t('usage.unlimited')}
              </p>
            ) : (
              <Progress
                value={percentage}
                className={colorClass ? `[&>div]:${colorClass}` : ''}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
