# TASK-4.5: paymentOrders.updateStatus Mutation

## Summary

Create mutation to change payment order status with state transition validation, permission checks, and history tracking.

## State Transitions Matrix

```
CREATED       -> IN_REVIEW, CANCELLED
IN_REVIEW     -> APPROVED, REJECTED, NEEDS_SUPPORT, CANCELLED
NEEDS_SUPPORT -> IN_REVIEW, CANCELLED
APPROVED      -> PAID
PAID          -> RECONCILED
```

## Permission Rules

| Transition                                  | Who Can Perform             |
| ------------------------------------------- | --------------------------- |
| CREATED → IN_REVIEW                         | Creator (submit for review) |
| CREATED → CANCELLED                         | Creator                     |
| IN_REVIEW → APPROVED/REJECTED/NEEDS_SUPPORT | Org admin/owner only        |
| IN_REVIEW → CANCELLED                       | Creator or org admin/owner  |
| NEEDS_SUPPORT → IN_REVIEW                   | Creator (resubmit)          |
| NEEDS_SUPPORT → CANCELLED                   | Creator or org admin/owner  |
| APPROVED → PAID                             | Org admin/owner only        |
| PAID → RECONCILED                           | Org admin/owner only        |

## Changes

### `convex/schema/status.ts`

Add valid transitions constant:

```typescript
export const VALID_TRANSITIONS: Record<
  PaymentOrderStatus,
  PaymentOrderStatus[]
> = {
  CREATED: ['IN_REVIEW', 'CANCELLED'],
  IN_REVIEW: ['APPROVED', 'REJECTED', 'NEEDS_SUPPORT', 'CANCELLED'],
  NEEDS_SUPPORT: ['IN_REVIEW', 'CANCELLED'],
  APPROVED: ['PAID'],
  PAID: ['RECONCILED'],
  REJECTED: [],
  RECONCILED: [],
  CANCELLED: [],
}
```

### `convex/paymentOrders.ts`

Add `updateStatus` mutation:

```typescript
export const updateStatus = mutation({
  args: {
    authKitId: v.string(),
    id: v.id('paymentOrders'),
    status: paymentOrderStatusValidator,
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Get order, validate exists
    // 2. Get user, validate exists
    // 3. Get profile for permission check
    // 4. Validate transition is allowed (using VALID_TRANSITIONS)
    // 5. Validate user has permission for this specific transition
    // 6. Update order: status, updatedAt
    // 7. Create history entry in paymentOrderHistory
    // 8. Return updated order
  },
})
```

## Files Modified

- `convex/schema/status.ts` - Add VALID_TRANSITIONS constant
- `convex/paymentOrders.ts` - Add updateStatus mutation

## Verification

1. Test valid transition: CREATED → IN_REVIEW (as creator)
2. Test invalid transition: CREATED → APPROVED (should fail)
3. Test permission: Non-admin tries to approve (should fail)
4. Test history: Verify history entry created after status change
5. Verify optional comment is stored in history
