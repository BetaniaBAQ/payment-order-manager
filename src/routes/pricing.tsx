import { useState } from 'react'

import { Link, createFileRoute } from '@tanstack/react-router'

import { useTranslation } from 'react-i18next'

import type { Tier } from '../../convex/lib/tierLimits'
import { PricingCards } from '@/components/billing/pricing-cards'
import { PricingToggle } from '@/components/billing/pricing-toggle'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/constants'


export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})

function PricingPage() {
  const { t } = useTranslation('billing')
  const { t: tc } = useTranslation('common')
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')
  // Default to COP for Colombia target market
  const [currency] = useState<'COP' | 'USD'>('COP')

  const handleSelect = (tier: Tier) => {
    if (tier === 'free') {
      // Redirect to signup/login
      window.location.href = '/dashboard'
      return
    }
    // For paid tiers, redirect to signup then billing
    window.location.href = '/dashboard'
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Button
            variant="link"
            className="p-0 text-xl font-semibold"
            render={(props) => (
              <Link {...props} to="/">
                {APP_NAME}
              </Link>
            )}
          />
          <Button
            variant="outline"
            size="sm"
            render={(props) => (
              <Link {...props} to="/dashboard">
                {tc('landing.signIn')}
              </Link>
            )}
          />
        </div>
      </header>

      <main className="flex-1">
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
      </main>

      <footer className="border-border border-t py-6">
        <div className="text-muted-foreground container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {APP_NAME}.{' '}
            {tc('landing.allRightsReserved')}
          </p>
          <nav className="flex gap-4">
            <Link to="/legal/privacy" className="hover:underline">
              {tc('landing.privacy')}
            </Link>
            <Link to="/legal/terms" className="hover:underline">
              {tc('landing.terms')}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
