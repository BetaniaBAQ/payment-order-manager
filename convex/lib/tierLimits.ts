export const TIER_LIMITS = {
  free: {
    orders: 10,
    storageMB: 500,
    users: 3,
    profiles: 1,
    emails: 50,
    historyMonths: 3,
  },
  pro: {
    orders: 200,
    storageMB: 20_480, // 20 GB
    users: Infinity,
    profiles: 10,
    emails: 2_000,
    historyMonths: 24, // 2 years
  },
  enterprise: {
    orders: 1_000,
    storageMB: 102_400, // 100 GB
    users: Infinity,
    profiles: Infinity,
    emails: 10_000,
    historyMonths: 60, // 5 years
  },
} as const

export type Tier = keyof typeof TIER_LIMITS
export type TierLimits = (typeof TIER_LIMITS)[Tier]

export const TIER_PRICES = {
  free: { cop: 0, usd: 0 },
  pro: { cop: 199_000_00, usd: 49_00 }, // $199,000 COP, $49 USD
  enterprise: { cop: 599_000_00, usd: 149_00 }, // $599,000 COP, $149 USD
} as const

export const ANNUAL_DISCOUNT = 0.2 // 20% off = 2 months free

export const IVA_RATE = 0.19

export function calculateCopTaxBreakdown(totalInCents: number) {
  const baseInCents = Math.round(totalInCents / (1 + IVA_RATE))
  const vatInCents = totalInCents - baseInCents
  return { baseInCents, vatInCents, consumptionInCents: 0 }
}

export const TIER_LABELS: Record<Tier, string> = {
  free: 'Gratis',
  pro: 'Pro',
  enterprise: 'Enterprise',
}
