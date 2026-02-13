import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { api } from 'convex/_generated/api'
import { SpinnerGap } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import type { Id } from 'convex/_generated/dataModel'


import type { Tier } from '../../../convex/lib/tierLimits'
import { UpgradeModal } from '@/components/billing/upgrade-modal'
import { UsageMeters } from '@/components/billing/usage-meters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createCustomerPortalSession } from '@/lib/billing'
import { convexQuery } from '@/lib/convex'
import { formatDate, useLocale } from '@/lib/format'


type BillingSettingsProps = {
  organizationId: Id<'organizations'>
  country: string
  slug: string
}

const STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  active: 'default',
  past_due: 'destructive',
  cancelled: 'destructive',
  pending_payment: 'secondary',
}

export function BillingSettings({
  organizationId,
  country,
  slug,
}: BillingSettingsProps) {
  const { t } = useTranslation('billing')
  const locale = useLocale()
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const { data, isLoading } = useQuery(
    convexQuery(api.subscriptions.getByOrganization, { organizationId }),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <SpinnerGap className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    )
  }

  const subscription = data?.subscription
  const tier = data?.tier ?? 'free'
  const limits = data?.limits ?? {
    orders: 10,
    storageMB: 500,
    users: 3,
    profiles: 1,
    emails: 50,
    historyMonths: 3,
  }
  const usage = data?.usage ?? { orders: 0, storageMB: 0, emails: 0 }
  const status = subscription?.status ?? 'active'
  const variant = STATUS_VARIANT[status] ?? STATUS_VARIANT.active

  const isStripe = subscription?.paymentProvider === 'stripe'
  const isWompi = subscription?.paymentProvider === 'wompi'
  const isPhysical = subscription?.paymentProvider === 'physical_contract'
  const isFree = tier === 'free'

  const handlePortal = async () => {
    if (!subscription?.providerCustomerId) return
    setPortalLoading(true)
    try {
      const result = await createCustomerPortalSession({
        data: { stripeCustomerId: subscription.providerCustomerId },
      })
      if (result.url) {
        window.location.href = result.url
      }
    } catch {
      // Error handled silently
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('subscription.title')}</CardTitle>
          <CardDescription>{t('subscription.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-base">
              {t(`tiers.${tier}`)}
            </Badge>
            {!isFree && (
              <Badge variant={variant}>
                {t(`subscription.status.${status}`)}
              </Badge>
            )}
          </div>

          {subscription && !isFree && !isPhysical && (
            <div className="text-muted-foreground space-y-1 text-sm">
              <p>
                {t('subscription.interval')}{' '}
                {subscription.billingInterval === 'annual'
                  ? t('subscription.annual')
                  : t('subscription.monthly')}
              </p>
              <p>
                {t('subscription.nextCharge')}{' '}
                {formatDate(subscription.currentPeriodEnd, locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          {isPhysical && (
            <p className="text-muted-foreground text-sm">
              {t('subscription.physicalContract')}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('usage.title')}</CardTitle>
          <CardDescription>{t('usage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <UsageMeters usage={usage} limits={limits} />
        </CardContent>
      </Card>

      {!isFree && (
        <Card>
          <CardHeader>
            <CardTitle>{t('paymentMethod.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isPhysical && (
              <p className="text-sm">{t('subscription.physicalContract')}</p>
            )}
            {isStripe && <p className="text-sm">{t('paymentMethod.stripe')}</p>}
            {isWompi && subscription.providerPaymentSourceId && (
              <p className="text-sm">{t('paymentMethod.wompiSaved')}</p>
            )}
            {isWompi && !subscription.providerPaymentSourceId && (
              <p className="text-sm">{t('paymentMethod.wompiManual')}</p>
            )}
          </CardContent>
        </Card>
      )}

      {!isPhysical && (
        <Card>
          <CardHeader>
            <CardTitle>{t('actions.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => setUpgradeOpen(true)}>
              {isFree ? t('actions.choosePlan') : t('actions.upgradePlan')}
            </Button>

            {isStripe && subscription.providerCustomerId && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  disabled={portalLoading}
                  onClick={handlePortal}
                >
                  {portalLoading && (
                    <SpinnerGap className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('actions.manageBilling')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <UpgradeModal
        organizationId={organizationId}
        currentTier={tier}
        country={country}
        slug={slug}
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
      />
    </div>
  )
}
