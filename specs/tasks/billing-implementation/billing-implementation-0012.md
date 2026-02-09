# 0012: Provider router server function

## Context

TanStack Start server functions that route payment requests to Wompi (CO) or Stripe (global) based on customer country. Called by upgrade modal / pricing page.

## Dependencies

- 0004 (TIER_PRICES, ANNUAL_DISCOUNT)
- 0010 (Wompi client — for reference format)
- 0011 (Stripe client — for checkout session creation)

## File

`src/lib/billing.ts` (new)

## Requirements

**createCheckoutSession** server function:

- Args: `{ organizationId: string, tier: 'pro' | 'enterprise', country: string, interval: 'monthly' | 'annual' }`
- If `country === 'CO'`:
  - Calc amount: monthly = `TIER_PRICES[tier].cop`, annual = `cop * 12 * (1 - ANNUAL_DISCOUNT)`
  - Return `{ provider: 'wompi', amountInCents, currency: 'COP', reference: "sub_{orgId}_{tier}_{timestamp}" }`
- Else:
  - Build price key: `${tier}_${interval}` → lookup in `STRIPE_PRICES`
  - Create Stripe Checkout Session (mode: subscription, metadata: organizationId + tier)
  - success_url: `${APP_URL}/orgs/{slug}/settings?billing=success`
  - cancel_url: `${APP_URL}/orgs/{slug}/settings?billing=cancelled`
  - Return `{ provider: 'stripe', checkoutUrl: session.url }`

**createCustomerPortalSession** server function:

- Args: `{ stripeCustomerId: string }`
- Creates Stripe billing portal session
- return_url: `${APP_URL}/settings`
- Return `{ url: session.url }`

Use `createServerFn` from `@tanstack/react-start`.

## Resources

- [TanStack Start Server Functions](https://tanstack.com/start/latest/docs/framework/react/server-functions)
- [Stripe Checkout Sessions](https://docs.stripe.com/api/checkout/sessions/create)
- [Stripe Customer Portal](https://docs.stripe.com/api/customer_portal/sessions/create)

## Definition of Done

- [ ] File exists at `src/lib/billing.ts`
- [ ] `createCheckoutSession` routes CO → Wompi data, else → Stripe Checkout URL
- [ ] `createCustomerPortalSession` creates Stripe portal session
- [ ] Annual discount applied correctly for Wompi (20% off)
- [ ] Reference format: `sub_{orgId}_{tier}_{timestamp}` (parseable by webhook handler)
- [ ] No secrets leaked to client (server functions only)
