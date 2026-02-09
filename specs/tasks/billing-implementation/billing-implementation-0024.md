# 0024: Pricing page route

## Context

Public (unauthenticated) pricing page at `/pricing`. Shows 3-tier comparison with COP/USD pricing based on detected country. Entry point for conversion funnel.

## Dependencies

- 0025 (PricingCards component)
- 0026 (PricingToggle component)

## File

`src/routes/pricing.tsx` (new)

## Requirements

- Public route (NOT under `_authenticated/` layout)
- Loader: detect country from request headers (`cf-ipcountry`, `x-vercel-ip-country`, or default 'CO')
- State: `interval` toggle (monthly/annual), default monthly
- Layout:
  - Hero section: headline + subtext
  - PricingToggle (monthly/annual)
  - PricingCards (3 columns)
  - FAQ section (optional, can add later)
- Currency logic: if country=CO show COP, else USD
- CTAs:
  - Free: link to signup `/` or WorkOS login
  - Pro/Enterprise (unauthenticated): link to signup, then redirect to billing
  - Pro/Enterprise (authenticated): open upgrade flow (0028)
- SEO: title "Precios - Payment Order Manager", meta description

## Resources

- Existing route pattern: `src/routes/_authenticated/dashboard.tsx`
- TanStack Router file-based routing

## Definition of Done

- [ ] Route accessible at `/pricing`
- [ ] Shows 3 tiers with correct prices
- [ ] Toggle switches between monthly/annual
- [ ] COP shown for CO visitors, USD for others
- [ ] Annual prices show 20% discount
- [ ] CTAs link to appropriate actions
- [ ] Responsive layout (mobile-friendly)
