# 0032: Add billing tab to org settings

## Context

Integrate BillingSettings component (0029) into existing organization settings page as a third tab alongside "General" and "Miembros".

## Dependencies

- 0029 (BillingSettings component)

## File

`src/routes/_authenticated/orgs/$slug/settings.tsx` (modify)

## Requirements

1. Add third tab to existing Tabs component: "Facturacion"
2. Render `<BillingSettings organizationId={org._id} country={country} />` inside tab
3. Prefetch subscription data in route loader:
   ```typescript
   ctx.convex.prefetchQuery(api.subscriptions.getByOrganization, {
     organizationId: org._id,
   })
   ```
4. Tab visible to org owner and admin roles only (same access as existing tabs)
5. Detect country: from user's locale, request headers, or default 'CO'

**Existing tabs structure** (in settings.tsx):

- Tab "General": GeneralSettings component
- Tab "Miembros": MembersSettings component
- New: Tab "Facturacion": BillingSettings component

## Resources

- Existing file: `src/routes/_authenticated/orgs/$slug/settings.tsx`
- Existing tab pattern in the file

## Definition of Done

- [ ] "Facturacion" tab visible in org settings
- [ ] BillingSettings renders in tab content
- [ ] Subscription data prefetched in loader
- [ ] Only visible to org owners/admins
- [ ] Tab matches existing styling
- [ ] No layout shift when switching tabs
