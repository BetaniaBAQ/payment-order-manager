# 0029: Billing settings component

## Context

Settings tab content showing current plan, usage, payment method, and management actions. Rendered inside org settings page (0032).

## Dependencies

- 0009 (getByOrganization query)
- 0030 (UsageMeters component)

## File

`src/components/billing/billing-settings.tsx` (new)

## Requirements

**Props:**

```typescript
{
  organizationId: Id<'organizations'>
  country: string
}
```

**Uses query:** `useQuery(api.subscriptions.getByOrganization, { organizationId })`

**Sections:**

1. **Plan actual:**
   - Tier badge (Free/Pro/Enterprise) with color
   - Status badge (active=green, past_due=yellow, cancelled=red)
   - Price per period (formatted COP or USD)
   - Billing interval (monthly/annual)
   - Next billing date: formatted `currentPeriodEnd`

2. **Uso:** render UsageMeters component (0030) with usage + limits

3. **Metodo de pago:**
   - If Stripe: "Tarjeta internacional" + link to Stripe Customer Portal
   - If Wompi with saved card: "Tarjeta •••• 1234" (last 4 if available)
   - If Wompi without card: "PSE / Nequi (pago manual cada mes)"
   - If free: "Sin metodo de pago"

4. **Acciones:**
   - "Mejorar plan" button → opens UpgradeModal (0028)
   - If Stripe: "Gestionar facturacion" → calls createCustomerPortalSession → redirect
   - "Cancelar suscripcion" link → confirmation dialog → TODO: cancel mutation
   - If free: only show upgrade button

Use shadcn Card, Badge, Button, Separator.

## Resources

- Existing settings pattern: `src/routes/_authenticated/orgs/$slug/settings.tsx`

## Definition of Done

- [ ] Component renders all 4 sections
- [ ] Subscription data fetched and displayed
- [ ] Free tier shows defaults correctly
- [ ] Upgrade button opens modal
- [ ] Stripe portal link works
- [ ] Responsive layout
