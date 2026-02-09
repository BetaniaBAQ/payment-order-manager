# 0011: Stripe client setup

## Context

Stripe SDK setup for international payments. Handles subscription billing, checkout sessions, customer portal. Secondary provider (non-Colombia customers).

## Dependencies

None

## File

`src/lib/stripe.ts` (new)

## Requirements

1. Install Stripe SDK: `pnpm add stripe`

2. Create client:

```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-01-27.acacia',
})

export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL ?? '',
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? '',
  enterprise_annual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL ?? '',
} as const
```

3. Environment variables for `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_ANNUAL=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
STRIPE_PRICE_ENTERPRISE_ANNUAL=price_xxx
```

- Price IDs created in Stripe Dashboard (Products → Add product → Add price)
- Pro: $49/mo, $470/yr. Enterprise: $149/mo, $1430/yr.

## Resources

- [Stripe Node SDK](https://github.com/stripe/stripe-node)
- [Stripe API Reference](https://docs.stripe.com/api)
- [Stripe Billing Quickstart](https://docs.stripe.com/billing/quickstart)
- Test card approved: `4242 4242 4242 4242`
- Test card declined: `4000 0000 0000 0002`

## Definition of Done

- [ ] `stripe` package added to `package.json`
- [ ] File exists at `src/lib/stripe.ts`
- [ ] Exports `stripe` instance and `STRIPE_PRICES`
- [ ] Uses `??` fallback (never `!` non-null assertion)
- [ ] Env vars documented
