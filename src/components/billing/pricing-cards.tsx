import { CheckIcon } from 'lucide-react'

import {
  ANNUAL_DISCOUNT,
  TIER_LABELS,
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

const TIER_FEATURES: Record<Tier, Array<string>> = {
  free: ['Órdenes de pago básicas', 'Gestión de documentos', '1 perfil'],
  pro: [
    'Todo en Gratis',
    'Tags y filtros avanzados',
    'Exportación CSV',
    'Usuarios ilimitados',
    'Hasta 10 perfiles',
  ],
  enterprise: [
    'Todo en Pro',
    'API y webhooks',
    'SSO (Single Sign-On)',
    'Reportes avanzados',
    'SLA 99.9%',
    'Perfiles ilimitados',
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
  const amount = currency === 'COP' ? amountInCents / 100 : amountInCents / 100
  return currency === 'COP'
    ? COP_FORMAT.format(amount)
    : USD_FORMAT.format(amount)
}

function formatLimit(value: number, label: string): string {
  if (value === Infinity) return `Ilimitado`
  return `${value} ${label}`
}

function getPrice(tier: Tier, currency: Currency): number {
  const key = currency === 'COP' ? 'cop' : 'usd'
  return TIER_PRICES[tier][key]
}

function getDiscountedPrice(monthlyPrice: number): number {
  return Math.round(monthlyPrice * (1 - ANNUAL_DISCOUNT))
}

const CTA_LABELS: Record<Tier, string> = {
  free: 'Comenzar gratis',
  pro: 'Elegir Pro',
  enterprise: 'Elegir Enterprise',
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
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {TIER_ORDER.map((tier) => {
        const limits = TIER_LIMITS[tier]
        const features = TIER_FEATURES[tier]
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
                Popular
              </div>
            )}

            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{TIER_LABELS[tier]}</CardTitle>
                {isCurrentTier && <Badge variant="outline">Plan actual</Badge>}
              </div>
              <CardDescription>
                {tier === 'free' && 'Para empezar a organizar tus pagos'}
                {tier === 'pro' && 'Para equipos en crecimiento'}
                {tier === 'enterprise' && 'Para grandes organizaciones'}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-6">
              {/* Price */}
              <div>
                {monthlyPrice === 0 ? (
                  <p className="text-3xl font-bold">Gratis</p>
                ) : (
                  <div>
                    {interval === 'annual' && (
                      <p className="text-muted-foreground text-sm line-through">
                        {formatPrice(monthlyPrice, currency)}/mes
                      </p>
                    )}
                    <p className="text-3xl font-bold">
                      {formatPrice(displayPrice, currency)}
                      <span className="text-muted-foreground text-sm font-normal">
                        /mes
                      </span>
                    </p>
                    {interval === 'annual' && (
                      <p className="text-sm font-medium text-green-600">
                        Ahorra 20%
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Limits */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Incluye:</p>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>{formatLimit(limits.orders, 'órdenes/mes')}</li>
                  <li>
                    {limits.storageMB >= 1024
                      ? `${Math.round(limits.storageMB / 1024)} GB almacenamiento`
                      : `${limits.storageMB} MB almacenamiento`}
                  </li>
                  <li>{formatLimit(limits.users, 'usuarios')}</li>
                  <li>{formatLimit(limits.profiles, 'perfiles')}</li>
                  <li>{formatLimit(limits.emails, 'emails/mes')}</li>
                  <li>{limits.historyMonths} meses de historial</li>
                </ul>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <ul className="space-y-1.5 text-sm">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckIcon className="text-primary h-4 w-4 shrink-0" />
                      {feature}
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
                {isCurrentTier ? 'Plan actual' : CTA_LABELS[tier]}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
