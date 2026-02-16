import { createServerFn } from '@tanstack/react-start'

import {
  ANNUAL_DISCOUNT,
  TIER_PRICES,
  calculateCopTaxBreakdown,
} from '../../convex/lib/tierLimits'
import { STRIPE_PRICES, getStripe } from './stripe'

export const createCheckoutSession = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      organizationId: string
      tier: 'pro' | 'enterprise'
      country: string
      interval: 'monthly' | 'annual'
    }) => data,
  )
  .handler(async ({ data }) => {
    // Colombia → Wompi
    if (data.country === 'CO') {
      const monthlyPrice = TIER_PRICES[data.tier].cop
      const amountInCents =
        data.interval === 'annual'
          ? Math.round(monthlyPrice * 12 * (1 - ANNUAL_DISCOUNT))
          : monthlyPrice

      const taxBreakdown = calculateCopTaxBreakdown(amountInCents)

      return {
        provider: 'wompi' as const,
        amountInCents,
        currency: 'COP',
        reference: `sub_${data.organizationId}_${data.tier}_${Date.now()}`,
        taxInCents: {
          vat: taxBreakdown.vatInCents,
          consumption: taxBreakdown.consumptionInCents,
        },
      }
    }

    // International → Stripe Checkout
    const priceKey =
      `${data.tier}_${data.interval}`
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: STRIPE_PRICES[priceKey], quantity: 1 }],
      success_url: `${process.env.APP_URL}/settings?billing=success`,
      cancel_url: `${process.env.APP_URL}/settings?billing=cancelled`,
      metadata: {
        organizationId: data.organizationId,
        tier: data.tier,
      },
    })

    return {
      provider: 'stripe' as const,
      checkoutUrl: session.url,
    }
  })

export const createCustomerPortalSession = createServerFn({ method: 'POST' })
  .inputValidator((data: { stripeCustomerId: string }) => data)
  .handler(async ({ data }) => {
    const session = await getStripe().billingPortal.sessions.create({
      customer: data.stripeCustomerId,
      return_url: `${process.env.APP_URL}/settings`,
    })
    return { url: session.url }
  })
