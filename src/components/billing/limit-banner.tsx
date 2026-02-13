import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { api } from 'convex/_generated/api'

import { AlertTriangleIcon, XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Id } from 'convex/_generated/dataModel'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { convexQuery } from '@/lib/convex'

type LimitBannerProps = {
  organizationId: Id<'organizations'>
  onUpgrade: () => void
}

export function LimitBanner({ organizationId, onUpgrade }: LimitBannerProps) {
  const { t } = useTranslation('billing')
  const [dismissed, setDismissed] = useState(false)

  const { data } = useQuery(
    convexQuery(api.subscriptions.getByOrganization, { organizationId }),
  )

  if (dismissed || !data) return null

  const { usage, limits } = data
  const ordersUsed = usage.orders
  const ordersLimit = limits.orders

  // Check for blocking state (at limit)
  if (ordersUsed >= ordersLimit && ordersLimit !== Infinity) {
    return (
      <Alert variant="destructive" className="relative">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{t('limits.reached')}</span>
          <Button size="sm" variant="outline" onClick={onUpgrade}>
            {t('actions.upgradePlan')}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  // Check for warning state (80%+ usage)
  const remaining = ordersLimit - ordersUsed
  if (ordersUsed >= ordersLimit * 0.8 && ordersLimit !== Infinity) {
    return (
      <Alert className="relative">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{t('limits.remaining', { remaining })}</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onUpgrade}>
              {t('actions.upgradePlan')}
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => setDismissed(true)}
            >
              <XIcon className="h-3 w-3" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
