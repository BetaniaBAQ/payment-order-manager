import { useState } from 'react'

import { createFileRoute } from '@tanstack/react-router'

import { useTranslation } from 'react-i18next'

import type { Tier } from '../../convex/lib/tierLimits'
import { PricingCards } from '@/components/billing/pricing-cards'
import { PricingToggle } from '@/components/billing/pricing-toggle'
import { PublicLayout } from '@/components/shared/public-layout'


export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})

function PricingPage() {
  const { t } = useTranslation('billing')
  const { t: tc } = useTranslation('common')
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')
  const [currency] = useState<'COP' | 'USD'>('COP')

  const navLinks = [{ label: tc('landing.pricing'), to: '/pricing' }]

  const handleSelect = (tier: Tier) => {
    if (tier === 'free') {
      window.location.href = '/dashboard'
      return
    }
    window.location.href = '/dashboard'
  }

  return (
    <PublicLayout navLinks={navLinks}>
      {/* Hero */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t('pricingPage.hero')}
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            {t('pricingPage.heroDescription')}
          </p>
        </div>
      </section>

      {/* Toggle */}
      <section className="flex justify-center pb-8">
        <PricingToggle interval={interval} onChange={setInterval} />
      </section>

      {/* Cards */}
      <section className="container mx-auto max-w-5xl px-4 pb-16">
        <PricingCards
          currency={currency}
          interval={interval}
          onSelect={handleSelect}
        />
      </section>
    </PublicLayout>
  )
}
