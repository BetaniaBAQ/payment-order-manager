import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    _stripe = new Stripe(key, {
      apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
    })
  }
  return _stripe
}

export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL ?? '',
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? '',
  enterprise_annual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL ?? '',
} as const
