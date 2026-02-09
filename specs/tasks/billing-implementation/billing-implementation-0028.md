# 0028: Upgrade modal

## Context

Modal dialog for upgrading subscription. Triggered by limit warnings, upgrade buttons, or pricing page CTAs. Routes to Wompi checkout (CO) or Stripe redirect (global).

## Dependencies

- 0012 (createCheckoutSession)
- 0025 (PricingCards — for tier selection)
- 0027 (WompiCheckout — for CO inline payment)

## File

`src/components/billing/upgrade-modal.tsx` (new)

## Requirements

**Props:**

```typescript
{
  organizationId: string
  currentTier: Tier
  country: string             // 'CO' or ISO code
  trigger?: 'limit' | 'manual'
  limitContext?: string        // "ordenes" | "perfiles" | "miembros"
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

**Content flow:**

1. If `trigger === 'limit'`: show alert "Alcanzaste el limite de {limitContext} de tu plan {currentTier}"
2. Tier selector: PricingCards (only tiers above current selectable)
3. Interval toggle: monthly/annual
4. **If country=CO:** render WompiCheckout inline after tier selection
5. **If country!=CO:** "Continuar" button → calls `createCheckoutSession` → redirects to Stripe Checkout URL via `window.location.href`
6. On success: close modal, show toast, refetch subscription data
7. On error: show error message in modal

Use shadcn Dialog, Alert.

## Definition of Done

- [ ] Modal opens/closes correctly
- [ ] Limit trigger shows context message
- [ ] Only higher tiers selectable
- [ ] CO → Wompi checkout inline
- [ ] Non-CO → Stripe redirect
- [ ] Success/error handling
- [ ] Interval toggle works
