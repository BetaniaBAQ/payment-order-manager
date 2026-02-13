import { useState } from 'react'

import { createServerFn } from '@tanstack/react-start'

import { SpinnerGap } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { generateIntegritySignature } from '@/lib/wompi'

const EXPIRATION_MS = 30 * 60 * 1000 // 30 minutes

// --- Server function ---

const prepareWompiCheckout = createServerFn({ method: 'POST' })
  .validator(
    (data: { reference: string; amountInCents: number; currency: string }) =>
      data,
  )
  .handler(({ data }) => ({
    publicKey: process.env.WOMPI_PUBLIC_KEY ?? '',
    signature: generateIntegritySignature({
      reference: data.reference,
      amountInCents: data.amountInCents,
      currency: data.currency,
    }),
  }))

// --- Formatters ---

const COP_FORMAT = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

function formatAmount(cents: number): string {
  return COP_FORMAT.format(cents / 100)
}

// --- Types ---

type WompiCheckoutProps = {
  amountInCents: number
  reference: string
  customerEmail: string
  taxInCents?: { vat: number; consumption: number }
  onSuccess: () => void
  onError: (error: string) => void
}

// --- Component ---

export function WompiCheckout({
  amountInCents,
  reference,
  customerEmail,
  taxInCents,
  onSuccess,
  onError,
}: WompiCheckoutProps) {
  const { t } = useTranslation('billing')
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    try {
      const { publicKey, signature } = await prepareWompiCheckout({
        data: { reference, amountInCents, currency: 'COP' },
      })

      const expirationTime = new Date(Date.now() + EXPIRATION_MS).toISOString()

      const checkout = new WidgetCheckout({
        currency: 'COP',
        amountInCents,
        reference,
        publicKey,
        signature: { integrity: signature },
        expirationTime,
        taxInCents,
        customerData: {
          email: customerEmail,
        },
      })

      checkout.open(() => {
        onSuccess()
      })
    } catch {
      onError(t('wompi.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 py-4 text-center">
      <p className="text-2xl font-bold">{formatAmount(amountInCents)}</p>
      <Button
        size="lg"
        className="w-full"
        disabled={loading}
        onClick={handlePayment}
      >
        {loading && <SpinnerGap className="mr-2 h-4 w-4 animate-spin" />}
        {t('wompi.pay')}
      </Button>
    </div>
  )
}
