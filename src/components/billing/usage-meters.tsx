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
  label: string
  used: number
  limit: number
  formatUsed: (n: number) => string
  formatLimit: (n: number) => string
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
  const meters: Array<MeterConfig> = [
    {
      label: 'Órdenes este mes',
      used: usage.orders,
      limit: limits.orders,
      formatUsed: (n) => String(n),
      formatLimit: (n) => (n === Infinity ? 'Ilimitado' : String(n)),
    },
    {
      label: 'Almacenamiento',
      used: usage.storageMB,
      limit: limits.storageMB,
      formatUsed: formatStorage,
      formatLimit: (n) => (n === Infinity ? 'Ilimitado' : formatStorage(n)),
    },
    {
      label: 'Emails este mes',
      used: usage.emails,
      limit: limits.emails,
      formatUsed: (n) => String(n),
      formatLimit: (n) => (n === Infinity ? 'Ilimitado' : String(n)),
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
          <div key={meter.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>{meter.label}</span>
              <span className="text-muted-foreground">
                {meter.formatUsed(meter.used)} /{' '}
                {meter.formatLimit(meter.limit)}
              </span>
            </div>
            {isUnlimited ? (
              <p className="text-muted-foreground text-xs">Ilimitado</p>
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
