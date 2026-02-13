import { useState } from 'react'

import { useNavigate } from '@tanstack/react-router'

import { CheckCircle, SpinnerGap } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

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
import { useUser } from '@/hooks/use-user'
import { createCheckoutSession } from '@/lib/billing'


type UpgradeModalProps = {
  organizationId: string
  currentTier: Tier
  country: string
  slug: string
  trigger?: 'limit' | 'manual'
  limitContext?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type ModalStep = 'select' | 'checkout' | 'success'

export function UpgradeModal({
  organizationId,
  currentTier,
  country,
  slug,
  trigger,
  limitContext,
  open,
  onOpenChange,
  onSuccess,
}: UpgradeModalProps) {
  const { t } = useTranslation('billing')
  const navigate = useNavigate()
  const user = useUser()

  const [selectedTier, setSelectedTier] = useState<Tier | null>(null)
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<ModalStep>('select')

  const [wompiData, setWompiData] = useState<{
    amountInCents: number
    reference: string
    taxInCents: { vat: number; consumption: number }
  } | null>(null)

  const isCol = country === 'CO'
  const currency = isCol ? ('COP' as const) : ('USD' as const)

  const handleTierSelect = async (tier: Tier) => {
    if (tier === 'free') return
    setSelectedTier(tier)
    setError(null)

    if (isCol) {
      setLoading(true)
      try {
        const result = await createCheckoutSession({
          data: { organizationId, tier, country, interval },
        })

        if ('amountInCents' in result) {
          setWompiData({
            amountInCents: result.amountInCents,
            reference: result.reference,
            taxInCents: result.taxInCents,
          })
          setStep('checkout')
        }
      } catch {
        setError(t('upgrade.paymentError'))
      } finally {
        setLoading(false)
      }
    }
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
      setError(t('upgrade.paymentError'))
    } finally {
      setLoading(false)
    }
  }

  const handleWompiSuccess = () => {
    setStep('success')
    onSuccess?.()
  }

  const handleWompiError = (msg: string) => {
    setError(msg)
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedTier(null)
      setError(null)
      setStep('select')
      setWompiData(null)
    }
    onOpenChange(isOpen)
  }

  const handleGoToBilling = () => {
    handleClose(false)
    void navigate({ to: '/orgs/$slug/settings', params: { slug } })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('upgrade.title')}</DialogTitle>
          <DialogDescription>{t('upgrade.description')}</DialogDescription>
        </DialogHeader>

        {trigger === 'limit' && limitContext && (
          <Alert variant="destructive">
            <AlertDescription>
              {t('upgrade.limitReached', {
                context: limitContext,
                tier: t(`tiers.${currentTier}`),
              })}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'success' ? (
          <div className="space-y-6 py-8 text-center">
            <CheckCircle className="text-primary mx-auto h-12 w-12" />
            <div className="space-y-2">
              <p className="text-lg font-semibold">
                {t('wompi.success.title')}
              </p>
              <p className="text-muted-foreground text-sm">
                {t('wompi.success.description')}
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => handleClose(false)}>
                {t('wompi.success.goBack')}
              </Button>
              <Button onClick={handleGoToBilling}>
                {t('wompi.success.goToBilling')}
              </Button>
            </div>
          </div>
        ) : step === 'checkout' && isCol && wompiData ? (
          <WompiCheckout
            amountInCents={wompiData.amountInCents}
            reference={wompiData.reference}
            customerEmail={user?.email ?? ''}
            taxInCents={wompiData.taxInCents}
            onSuccess={handleWompiSuccess}
            onError={handleWompiError}
          />
        ) : !selectedTier ? (
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
            {loading && (
              <div className="flex justify-center">
                <SpinnerGap className="text-muted-foreground h-6 w-6 animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4 text-center">
            <p>
              {t('upgrade.selectedPlan', {
                tier: t(`tiers.${selectedTier}`),
                interval:
                  interval === 'annual'
                    ? t('upgrade.intervalAnnual')
                    : t('upgrade.intervalMonthly'),
              })}
            </p>
            <Button size="lg" disabled={loading} onClick={handleStripeCheckout}>
              {loading && <SpinnerGap className="mr-2 h-4 w-4 animate-spin" />}
              {t('upgrade.continueToPayment')}
            </Button>
            <Button variant="ghost" onClick={() => setSelectedTier(null)}>
              {t('upgrade.changePlan')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
