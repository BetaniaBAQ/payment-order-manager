# 0031: Limit warning banner

## Context

Banner displayed at top of profile/order pages when user approaches or hits tier limits. Drives upgrade conversion.

## Dependencies

- 0009 (getByOrganization query)

## File

`src/components/billing/limit-banner.tsx` (new)

## Requirements

**Props:**

```typescript
{
  organizationId: Id<'organizations'>
  onUpgrade: () => void  // opens upgrade modal
}
```

**Uses query:** `useQuery(api.subscriptions.getByOrganization, { organizationId })`

**Logic:**

- If `usage.orders >= limits.orders`: **blocking** banner — "Alcanzaste el limite de ordenes de tu plan {tier}. Mejora tu plan para continuar." + "Mejorar plan" button
- Else if `usage.orders >= limits.orders * 0.8`: **warning** banner — "Te quedan {remaining} ordenes este mes." + "Mejorar plan" link
- Same logic for storage (storageMB)
- If tier=free and no warning: subtle "Plan gratuito" indicator (optional)
- Dismissable per session (useState, resets on page reload)

Use shadcn Alert component with variants: default (warning), destructive (blocking).

**Placement:** import and render in:

- `src/routes/_authenticated/orgs/$slug/profiles/$profileSlug/index.tsx` (order list page)

## Definition of Done

- [ ] Banner renders based on usage thresholds
- [ ] Blocking state prevents order creation (visually)
- [ ] Warning state shows remaining count
- [ ] Dismissable per session
- [ ] "Mejorar plan" triggers onUpgrade callback
- [ ] Doesn't render when usage is healthy
