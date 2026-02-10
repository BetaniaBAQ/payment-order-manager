import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { api } from 'convex/_generated/api'
import { Loader2Icon } from 'lucide-react'
import { TIER_LABELS } from '../../../convex/lib/tierLimits'
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


type BillingSettingsProps = {
  organizationId: Id<'organizations'>
  country: string
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  active: { label: 'Activo', variant: 'default' },
  past_due: { label: 'Pago pendiente', variant: 'destructive' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
  pending_payment: { label: 'Pendiente', variant: 'secondary' },
}

const DATE_FORMAT = new Intl.DateTimeFormat('es-CO', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export function BillingSettings({
  organizationId,
  country,
}: BillingSettingsProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const { data, isLoading } = useQuery(
    convexQuery(api.subscriptions.getByOrganization, { organizationId }),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="text-muted-foreground h-6 w-6 animate-spin" />
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
  const statusConfig =
    STATUS_CONFIG[subscription?.status ?? 'active'] ?? STATUS_CONFIG.active

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
      {/* Plan actual */}
      <Card>
        <CardHeader>
          <CardTitle>Plan actual</CardTitle>
          <CardDescription>
            Tu suscripción y estado de facturación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-base">
              {TIER_LABELS[tier]}
            </Badge>
            {!isFree && (
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            )}
          </div>

          {subscription && !isFree && !isPhysical && (
            <div className="text-muted-foreground space-y-1 text-sm">
              <p>
                Intervalo:{' '}
                {subscription.billingInterval === 'annual'
                  ? 'Anual'
                  : 'Mensual'}
              </p>
              <p>
                Próximo cobro:{' '}
                {DATE_FORMAT.format(subscription.currentPeriodEnd)}
              </p>
            </div>
          )}

          {isPhysical && (
            <p className="text-muted-foreground text-sm">
              Contrato físico (administrado manualmente)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Uso */}
      <Card>
        <CardHeader>
          <CardTitle>Uso</CardTitle>
          <CardDescription>Consumo del período actual</CardDescription>
        </CardHeader>
        <CardContent>
          <UsageMeters usage={usage} limits={limits} />
        </CardContent>
      </Card>

      {/* Método de pago */}
      {!isFree && (
        <Card>
          <CardHeader>
            <CardTitle>Método de pago</CardTitle>
          </CardHeader>
          <CardContent>
            {isPhysical && (
              <p className="text-sm">
                Contrato físico (administrado manualmente)
              </p>
            )}
            {isStripe && (
              <p className="text-sm">Tarjeta internacional (Stripe)</p>
            )}
            {isWompi && subscription.providerPaymentSourceId && (
              <p className="text-sm">Tarjeta guardada (débito automático)</p>
            )}
            {isWompi && !subscription.providerPaymentSourceId && (
              <p className="text-sm">PSE / Nequi (pago manual cada mes)</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      {!isPhysical && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => setUpgradeOpen(true)}>
              {isFree ? 'Elegir un plan' : 'Mejorar plan'}
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
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Gestionar facturación
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
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
      />
    </div>
  )
}
