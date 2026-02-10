import { useState } from 'react'

import { Loader2Icon } from 'lucide-react'

import { TIER_LABELS } from '../../../convex/lib/tierLimits'
import type { Tier } from '../../../convex/lib/tierLimits'
import { PricingCards } from '@/components/billing/pricing-cards'
import { PricingToggle } from '@/components/billing/pricing-toggle'
import { WompiCheckout } from '@/components/billing/wompi-checkout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createCheckoutSession } from '@/lib/billing'


type UpgradeModalProps = {
  organizationId: string
  currentTier: Tier
  country: string
  trigger?: 'limit' | 'manual'
  limitContext?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UpgradeModal({
  organizationId,
  currentTier,
  country,
  trigger,
  limitContext,
  open,
  onOpenChange,
  onSuccess,
}: UpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null)
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCol = country === 'CO'
  const currency = isCol ? ('COP' as const) : ('USD' as const)

  const handleTierSelect = (tier: Tier) => {
    if (tier === 'free') return
    setSelectedTier(tier)
    setError(null)
  }

  const handleStripeCheckout = async () => {
    if (!selectedTier || selectedTier === 'free') return

    setLoading(true)
    setError(null)
    try {
      const result = await createCheckoutSession({
        data: {
          organizationId,
          tier: selectedTier,
          country,
          interval,
        },
      })

      if ('checkoutUrl' in result && result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      }
    } catch {
      setError('Error al iniciar el proceso de pago')
    } finally {
      setLoading(false)
    }
  }

  const handleWompiSuccess = () => {
    onOpenChange(false)
    onSuccess?.()
  }

  const handleWompiError = (msg: string) => {
    setError(msg)
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedTier(null)
      setError(null)
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Mejorar plan</DialogTitle>
          <DialogDescription>
            Selecciona el plan que mejor se adapte a tus necesidades.
          </DialogDescription>
        </DialogHeader>

        {trigger === 'limit' && limitContext && (
          <Alert variant="destructive">
            <AlertDescription>
              Alcanzaste el límite de {limitContext} de tu plan{' '}
              {TIER_LABELS[currentTier]}.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!selectedTier ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <PricingToggle interval={interval} onChange={setInterval} />
            </div>
            <PricingCards
              currency={currency}
              interval={interval}
              currentTier={currentTier}
              onSelect={handleTierSelect}
            />
          </div>
        ) : isCol ? (
          <WompiCheckout
            amountInCents={0} // Will be set by createCheckoutSession
            currency="COP"
            reference={`sub_${organizationId}_${selectedTier}_${Date.now()}`}
            customerEmail="" // Will be set from user context
            organizationId={organizationId}
            onSuccess={handleWompiSuccess}
            onError={handleWompiError}
          />
        ) : (
          <div className="space-y-4 py-4 text-center">
            <p>
              Has seleccionado el plan{' '}
              <strong>{TIER_LABELS[selectedTier]}</strong> (
              {interval === 'annual' ? 'anual' : 'mensual'}).
            </p>
            <Button size="lg" disabled={loading} onClick={handleStripeCheckout}>
              {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Continuar al pago
            </Button>
            <Button variant="ghost" onClick={() => setSelectedTier(null)}>
              Cambiar plan
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
