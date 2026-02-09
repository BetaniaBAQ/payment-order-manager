# 0004: Tier limits and prices constants

## Context

Central config for tier limits and pricing. Used by limit checkers, UI components, and provider router. Amounts in smallest currency unit (centavos COP, cents USD).

## Dependencies

None

## File

`convex/lib/tierLimits.ts` (new)

## Requirements

```typescript
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
```

- Export `Tier` type for use across codebase
- Export `TierLimits` type for component props
- `as const` for type-safe access
- File lives in `convex/lib/` so it's importable from both Convex functions and frontend (via path alias)

## Resources

- Pricing spec: `specs/subscription-plan.md`

## Definition of Done

- [ ] File exists at `convex/lib/tierLimits.ts`
- [ ] All 3 tiers with correct limits
- [ ] Prices match spec ($199K COP Pro, $599K COP Enterprise)
- [ ] Types exported: `Tier`, `TierLimits`
- [ ] `ANNUAL_DISCOUNT = 0.2`
