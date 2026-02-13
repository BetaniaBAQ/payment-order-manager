import { Check } from '@phosphor-icons/react'
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
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'


type Currency = 'COP' | 'USD'
type BillingInterval = 'monthly' | 'annual'

type PricingCardsProps = {
  currency: Currency
  interval: BillingInterval
  currentTier?: Tier
  onSelect: (tier: Tier) => void
}

const TIER_ORDER: Array<Tier> = ['free', 'pro', 'enterprise']

type FeatureItem = string | { key: string; params: Record<string, number> }

const TIER_UNIFIED_FEATURES: Record<Tier, Array<FeatureItem>> = {
  free: [
    'pricing.features.basicOrders',
    'pricing.features.documentManagement',
    'pricing.features.oneProfile',
    {
      key: 'pricing.features.emailsCount',
      params: { count: TIER_LIMITS.free.emails },
    },
    {
      key: 'pricing.features.historyCount',
      params: { count: TIER_LIMITS.free.historyMonths },
    },
  ],
  pro: [
    'pricing.features.everythingInFree',
    'pricing.features.tagsAndFilters',
    'pricing.features.csvExport',
    'pricing.features.unlimitedUsers',
    'pricing.features.upTo10Profiles',
    {
      key: 'pricing.features.emailsCount',
      params: { count: TIER_LIMITS.pro.emails },
    },
    {
      key: 'pricing.features.historyCount',
      params: { count: TIER_LIMITS.pro.historyMonths },
    },
  ],
  enterprise: [
    'pricing.features.everythingInPro',
    'pricing.features.apiAndWebhooks',
    'pricing.features.sso',
    'pricing.features.advancedReports',
    'pricing.features.sla',
    'pricing.features.unlimitedProfiles',
    {
      key: 'pricing.features.emailsCount',
      params: { count: TIER_LIMITS.enterprise.emails },
    },
    {
      key: 'pricing.features.historyCount',
      params: { count: TIER_LIMITS.enterprise.historyMonths },
    },
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
  maximumFractionDigits: 0,
})

function formatPriceInteger(amountInCents: number, currency: Currency): string {
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

function formatMetricValue(value: number): string {
  if (value === Infinity) return '∞'
  return value.toLocaleString()
}

function formatStorageValue(storageMB: number): string {
  if (storageMB >= 1024) return `${Math.round(storageMB / 1024)} GB`
  return `${storageMB} MB`
}

export function PricingCards({
  currency,
  interval,
  currentTier,
  onSelect,
}: PricingCardsProps) {
  const { t } = useTranslation('billing')

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {TIER_ORDER.map((tier) => {
        const limits = TIER_LIMITS[tier]
        const features = TIER_UNIFIED_FEATURES[tier]
        const monthlyPrice = getPrice(tier, currency)
        const isCurrentTier = currentTier === tier
        const isLowerTier =
          currentTier !== undefined && TIER_RANK[tier] < TIER_RANK[currentTier]
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
            className={cn(
              'relative flex flex-col',
              isPro &&
                'ring-primary/40 shadow-primary/10 bg-primary/[0.02] dark:bg-primary/[0.06] shadow-lg ring-2 md:scale-[1.02]',
              isCurrentTier && !isPro && 'ring-border ring-1',
              isLowerTier && 'opacity-50',
            )}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{t(`tiers.${tier}`)}</CardTitle>
                {isPro && (
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    {t('pricing.popular')}
                  </Badge>
                )}
                {isCurrentTier && (
                  <Badge variant="outline">{t('pricing.currentPlan')}</Badge>
                )}
              </div>
              <CardDescription>
                {t(`pricing.descriptions.${tier}`)}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-5">
              {/* Price */}
              <div>
                {monthlyPrice === 0 ? (
                  <p className="text-4xl font-bold tracking-tight">
                    {t('pricing.free')}
                  </p>
                ) : (
                  <div>
                    {interval === 'annual' && (
                      <p className="text-muted-foreground text-sm line-through">
                        {formatPriceInteger(monthlyPrice, currency)}
                        {t('pricing.perMonth')}
                      </p>
                    )}
                    <p className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">
                        {formatPriceInteger(displayPrice, currency)}
                      </span>
                      <span className="text-muted-foreground text-sm">
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

              {/* Hero Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold tracking-tight">
                    {formatMetricValue(limits.orders)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t('pricing.keyMetrics.orders')}
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">
                    {formatStorageValue(limits.storageMB)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t('pricing.keyMetrics.storage')}
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">
                    {formatMetricValue(limits.users)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t('pricing.keyMetrics.users')}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Unified Features */}
              <ul className="space-y-2 text-sm">
                {features.map((item) => {
                  const key = typeof item === 'string' ? item : item.key
                  const text =
                    typeof item === 'string'
                      ? t(item)
                      : t(item.key, item.params)

                  return (
                    <li key={key} className="flex items-center gap-2">
                      <Check className="text-primary h-4 w-4 shrink-0" />
                      {text}
                    </li>
                  )
                })}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={isPro ? 'default' : 'outline'}
                size={isPro ? 'lg' : 'default'}
                disabled={isDowngrade}
                onClick={() => onSelect(tier)}
              >
                {isCurrentTier
                  ? t('pricing.currentPlan')
                  : isLowerTier
                    ? t('pricing.cta.downgrade')
                    : t(`pricing.cta.${tier}`)}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
