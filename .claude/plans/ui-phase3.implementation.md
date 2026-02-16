# UI Phase 3 — Pages, Dashboard, Forms, Empty States & Loading

## Summary

Elevate all route pages to match sidebar's refined feel with real metrics, contextual empty states, polished layouts, and smooth transitions.

## Implementation Order

1. **3.2** Empty States — icon + action props on EmptyState
2. **3.5** Loading States — content-only skeletons, fade-in, spinner overlay
3. **3.4** Forms — cancel i18n, dialog width, new org accent
4. **3.3** Profile/Order Polish — badge prop, 2-col layout, hover, timeline
5. **3.1** Dashboard — metrics row, Convex query, profile card accents

## Files Changed

### 3.2

- `src/components/shared/empty-state.tsx` — add `icon` + `action` props
- `src/routes/_authenticated/orgs/$slug/index.tsx` — profiles empty state
- `src/components/payment-orders/order-list.tsx` — orders empty state
- `src/i18n/locales/{en,es}/common.json` — empty descriptions + action keys

### 3.5

- `src/components/shared/page-skeleton.tsx` — content-only (no header)
- `src/components/dashboard/dashboard-skeleton.tsx` — **NEW**
- `src/routes/_authenticated.tsx` — fade-in on main
- `src/components/payment-orders/order-list.tsx` — loading overlay + Spinner

### 3.4

- `src/components/forms/form-dialog.tsx` — cancel i18n, className prop
- `src/components/payment-orders/create-order-dialog.tsx` — wider dialog
- `src/routes/_authenticated/orgs/new.tsx` — teal accent, Buildings icon

### 3.3

- `src/components/shared/page-header.tsx` — badge prop
- `src/routes/.../profiles/$profileSlug/index.tsx` — badge in header
- `src/routes/.../orders/$orderId.tsx` — two-col layout
- `src/components/payment-orders/order-card.tsx` — hover refinement
- `src/components/payment-orders/order-info-card.tsx` — serif amount, separators
- `src/components/payment-orders/order-timeline.tsx` — teal tint, color-coded dots

### 3.1

- `src/routes/_authenticated/orgs/$slug/index.tsx` — metrics, card accents
- `src/components/dashboard/metric-card.tsx` — **NEW**
- `convex/paymentOrders.ts` — `getStatusCountsByOrganization` query
- `src/i18n/locales/{en,es}/settings.json` — metric keys
