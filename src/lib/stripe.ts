import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
})

export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL ?? '',
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? '',
  enterprise_annual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL ?? '',
} as const
