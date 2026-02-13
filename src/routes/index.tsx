import { useState } from 'react'

import { Link, createFileRoute } from '@tanstack/react-router'

import { useTranslation } from 'react-i18next'

import type { Tier } from '../../convex/lib/tierLimits'
import { PricingCards } from '@/components/billing/pricing-cards'
import { PricingToggle } from '@/components/billing/pricing-toggle'
import { PublicLayout } from '@/components/shared/public-layout'
import { Button } from '@/components/ui/button'


export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  const { t } = useTranslation('common')
  const { t: tb } = useTranslation('billing')
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')
  const [currency] = useState<'COP' | 'USD'>('COP')

  const navLinks = [{ label: t('landing.pricing'), to: '/pricing' }]

  const handleSelect = (_tier: Tier) => {
    window.location.href = '/dashboard'
  }

  return (
    <PublicLayout navLinks={navLinks}>
      {/* Hero */}
      <section className="flex flex-col items-center px-4 py-24">
        <div className="max-w-2xl space-y-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t('landing.hero')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('landing.heroDescription')}
          </p>
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              render={(props) => (
                <Link {...props} to="/dashboard">
                  {t('landing.getStarted')}
                </Link>
              )}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-border border-t py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {tb('pricingPage.hero')}
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              {tb('pricingPage.heroDescription')}
            </p>
          </div>

          <div className="flex justify-center py-8">
            <PricingToggle interval={interval} onChange={setInterval} />
          </div>

          <div className="mx-auto max-w-5xl">
            <PricingCards
              currency={currency}
              interval={interval}
              onSelect={handleSelect}
            />
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
