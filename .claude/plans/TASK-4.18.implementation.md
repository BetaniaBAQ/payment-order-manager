# TASK-4.18: Payment Order Detail Page

## Summary

Create `/orgs/$slug/profiles/$profileSlug/orders/$orderId` detail page with order info, history timeline, and action buttons.

## Decisions

- Route nested under profile for consistent breadcrumbs
- Include action buttons (merging TASK-4.21 scope)

## Changes

### `src/routes/_authenticated/orgs/$slug/profiles/$profileSlug/orders/$orderId.tsx` (new)

```typescript
export const Route = createFileRoute(
  '/_authenticated/orgs/$slug/profiles/$profileSlug/orders/$orderId',
)({
  loader: async ({ context, params }) => {
    // Fetch order, redirect if not found/no access
  },
  component: OrderDetailPage,
})

function OrderDetailPage() {
  // Sections:
  // 1. Header: title, status badge, back button
  // 2. Info card: amount, currency, reason, description, dates, creator, tag
  // 3. Timeline: history entries (basic list, TASK-4.19 will enhance)
  // 4. Documents: placeholder for TASK-4.20
}
```

### Components to create

**`src/components/payment-orders/order-detail-header.tsx`**

- Title, status badge, back link
- Action buttons slot (for TASK-4.21)

**`src/components/payment-orders/order-info-card.tsx`**

- Amount, currency, reason, description
- Created date, updated date
- Creator info with avatar
- Tag badge

**`src/components/payment-orders/order-timeline.tsx`** (basic)

- Simple list of history entries
- User avatar, action description, timestamp
- TASK-4.19 will enhance with proper timeline UI

**`src/components/payment-orders/order-actions.tsx`**

- Renders action buttons based on current status + user role
- Uses VALID_TRANSITIONS to determine available actions
- Buttons: Submit for Review, Cancel, Approve, Reject, Request Support, Mark Paid, Reconcile
- Each action calls `updateStatus` mutation with appropriate status

### Update `src/components/payment-orders/order-card.tsx`

- Make card clickable, link to detail page

## Files

- `src/routes/_authenticated/orgs/$slug/profiles/$profileSlug/orders/$orderId.tsx` (new)
- `src/components/payment-orders/order-detail-header.tsx` (new)
- `src/components/payment-orders/order-info-card.tsx` (new)
- `src/components/payment-orders/order-timeline.tsx` (new)
- `src/components/payment-orders/order-actions.tsx` (new)
- `src/components/payment-orders/order-card.tsx` (update - add link)
- `src/components/payment-orders/index.ts` (update exports)

## Verification

1. Navigate to order from profile page
2. See order details, history timeline
3. 404 page if order doesn't exist
4. Redirect if no access (same as getById returning null)
5. Back button returns to profile page
