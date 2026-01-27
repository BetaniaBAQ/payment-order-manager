# TASK-4.8: paymentOrderHistory.getByPaymentOrder Query

## Summary

Create query to fetch payment order history with user details for timeline display.

## Changes

### `convex/paymentOrderHistory.ts` (new file)

```typescript
export const getByPaymentOrder = query({
  args: {
    paymentOrderId: v.id('paymentOrders'),
    authKitId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Verify user has access to the payment order
    // 2. Fetch history entries using by_paymentOrder index
    // 3. Order by createdAt ascending (oldest first)
    // 4. Enrich with user data (name, email, avatarUrl)
    // 5. Return enriched history entries
  },
})
```

### Return Shape

```typescript
{
  _id: Id<'paymentOrderHistory'>
  action: HistoryAction
  previousStatus?: PaymentOrderStatus
  newStatus?: PaymentOrderStatus
  comment?: string
  createdAt: number
  user: {
    _id: Id<'users'>
    name: string
    email: string
    avatarUrl?: string
  }
}[]
```

## Files

- `convex/paymentOrderHistory.ts` - New file with getByPaymentOrder query

## Verification

1. Create order, check history has CREATED entry
2. Update status, check history has STATUS_CHANGED entry
3. Verify entries ordered oldest→newest
4. Verify user data is included
