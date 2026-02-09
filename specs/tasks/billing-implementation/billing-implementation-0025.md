# 0025: Pricing cards component

## Context

3-column comparison cards for Free/Pro/Enterprise tiers. Reusable across pricing page and upgrade modal. Shows limits, features, and price per tier.

## Dependencies

- 0004 (TIER_LIMITS, TIER_PRICES, ANNUAL_DISCOUNT)

## File

`src/components/billing/pricing-cards.tsx` (new)

## Requirements

**Props:**

```typescript
{
  currency: 'COP' | 'USD'
  interval: 'monthly' | 'annual'
  currentTier?: Tier          // highlight current plan
  onSelect: (tier: Tier) => void
}
```

**Each card shows:**

- Tier name + badge (current plan indicator if applicable)
- Price: formatted for currency (COP: $199.000/mes, USD: $49/mo)
- Annual: show crossed-out monthly price + discounted price + "Ahorra 20%"
- Limits list: ordenes/mes, almacenamiento, usuarios, perfiles, emails, historial
- Feature list:
  - Pro: Tags, Filtros avanzados, Exportacion CSV
  - Enterprise: API, Webhooks, SSO, Reportes avanzados, SLA 99.9%
- CTA button: "Comenzar gratis" / "Elegir Pro" / "Elegir Enterprise"
- Disabled/grayed if selecting current or lower tier

**Formatting helpers:**

- COP: `new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })`
- USD: `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
- Infinity → "Ilimitado" / "Unlimited"

Use shadcn: Card, CardHeader, CardContent, Button, Badge

## Resources

- shadcn Card: already in `src/components/ui/card.tsx`
- Pricing spec: `specs/subscription-plan.md`

## Definition of Done

- [ ] Component renders 3 cards
- [ ] Prices formatted correctly for both currencies
- [ ] Annual discount shown with strikethrough
- [ ] Feature lists differ per tier
- [ ] Current tier highlighted
- [ ] onSelect fires with correct tier
- [ ] Responsive: stacks on mobile
