import { CheckIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  ANNUAL_DISCOUNT,
  TIER_LIMITS,
  TIER_PRICES,
} from '../../../convex/lib/tierLimits'
import type { Tier } from '../../../convex/lib/tierLimits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'


type Currency = 'COP' | 'USD'
type BillingInterval = 'monthly' | 'annual'

type PricingCardsProps = {
  currency: Currency
  interval: BillingInterval
  currentTier?: Tier
  onSelect: (tier: Tier) => void
}

const TIER_ORDER: Array<Tier> = ['free', 'pro', 'enterprise']

const TIER_FEATURE_KEYS: Record<Tier, Array<string>> = {
  free: [
    'pricing.features.basicOrders',
    'pricing.features.documentManagement',
    'pricing.features.oneProfile',
  ],
  pro: [
    'pricing.features.everythingInFree',
    'pricing.features.tagsAndFilters',
    'pricing.features.csvExport',
    'pricing.features.unlimitedUsers',
    'pricing.features.upTo10Profiles',
  ],
  enterprise: [
    'pricing.features.everythingInPro',
    'pricing.features.apiAndWebhooks',
    'pricing.features.sso',
    'pricing.features.advancedReports',
    'pricing.features.sla',
    'pricing.features.unlimitedProfiles',
  ],
}

const COP_FORMAT = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const USD_FORMAT = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function formatPrice(amountInCents: number, currency: Currency): string {
  const amount = amountInCents / 100
  return currency === 'COP'
    ? COP_FORMAT.format(amount)
    : USD_FORMAT.format(amount)
}

function getPrice(tier: Tier, currency: Currency): number {
  const key = currency === 'COP' ? 'cop' : 'usd'
  return TIER_PRICES[tier][key]
}

function getDiscountedPrice(monthlyPrice: number): number {
  return Math.round(monthlyPrice * (1 - ANNUAL_DISCOUNT))
}

const TIER_RANK: Record<Tier, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
}

export function PricingCards({
  currency,
  interval,
  currentTier,
  onSelect,
}: PricingCardsProps) {
  const { t } = useTranslation('billing')

  function formatLimit(value: number, label: string): string {
    if (value === Infinity) return t('pricing.unlimited')
    return `${value} ${label}`
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {TIER_ORDER.map((tier) => {
        const limits = TIER_LIMITS[tier]
        const featureKeys = TIER_FEATURE_KEYS[tier]
        const monthlyPrice = getPrice(tier, currency)
        const isCurrentTier = currentTier === tier
        const isDowngrade =
          currentTier !== undefined && TIER_RANK[tier] <= TIER_RANK[currentTier]
        const isPro = tier === 'pro'

        const displayPrice =
          interval === 'annual'
            ? getDiscountedPrice(monthlyPrice)
            : monthlyPrice

        return (
          <Card
            key={tier}
            className={`relative flex flex-col ${isPro ? 'border-primary border-2' : ''}`}
          >
            {isPro && (
              <div className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium">
                {t('pricing.popular')}
              </div>
            )}

            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{t(`tiers.${tier}`)}</CardTitle>
                {isCurrentTier && (
                  <Badge variant="outline">{t('pricing.currentPlan')}</Badge>
                )}
              </div>
              <CardDescription>
                {t(`pricing.descriptions.${tier}`)}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-6">
              {/* Price */}
              <div>
                {monthlyPrice === 0 ? (
                  <p className="text-3xl font-bold">{t('pricing.free')}</p>
                ) : (
                  <div>
                    {interval === 'annual' && (
                      <p className="text-muted-foreground text-sm line-through">
                        {formatPrice(monthlyPrice, currency)}
                        {t('pricing.perMonth')}
                      </p>
                    )}
                    <p className="text-3xl font-bold">
                      {formatPrice(displayPrice, currency)}
                      <span className="text-muted-foreground text-sm font-normal">
                        {t('pricing.perMonth')}
                      </span>
                    </p>
                    {interval === 'annual' && (
                      <p className="text-sm font-medium text-green-600">
                        {t('pricing.save20')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Limits */}
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('pricing.includes')}</p>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>
                    {formatLimit(limits.orders, t('pricing.ordersPerMonth'))}
                  </li>
                  <li>
                    {limits.storageMB >= 1024
                      ? t('pricing.storageGB', {
                          size: Math.round(limits.storageMB / 1024),
                        })
                      : t('pricing.storageMB', { size: limits.storageMB })}
                  </li>
                  <li>{formatLimit(limits.users, t('pricing.users'))}</li>
                  <li>{formatLimit(limits.profiles, t('pricing.profiles'))}</li>
                  <li>
                    {formatLimit(limits.emails, t('pricing.emailsPerMonth'))}
                  </li>
                  <li>
                    {t('pricing.historyMonths', {
                      count: limits.historyMonths,
                    })}
                  </li>
                </ul>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <ul className="space-y-1.5 text-sm">
                  {featureKeys.map((key) => (
                    <li key={key} className="flex items-center gap-2">
                      <CheckIcon className="text-primary h-4 w-4 shrink-0" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={isPro ? 'default' : 'outline'}
                disabled={isDowngrade}
                onClick={() => onSelect(tier)}
              >
                {isCurrentTier
                  ? t('pricing.currentPlan')
                  : t(`pricing.cta.${tier}`)}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
