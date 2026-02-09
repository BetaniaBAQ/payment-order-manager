# 0015: handleWompiEvent mutation

## Context

Convex mutation called by Wompi webhook (0013). Processes payment results: creates/updates subscription on APPROVED, marks past_due on DECLINED/ERROR. Idempotent via paymentEvents table.

## Dependencies

- 0009 (convex/subscriptions.ts file exists)
- 0002 (paymentEvents table for idempotency)

## File

`convex/subscriptions.ts` (add mutation)

## Requirements

```typescript
export const handleWompiEvent = mutation({
  args: {
    reference: v.string(),      // "sub_{orgId}_{tier}_{timestamp}"
    status: v.string(),          // "APPROVED", "DECLINED", "VOIDED", "ERROR"
    transactionId: v.string(),   // Wompi transaction ID
    paymentMethod: v.string(),   // "NEQUI", "PSE", "CARD", etc
    amountInCents: v.number(),
  },
  handler: async (ctx, args) => { ... }
})
```

Logic:

1. **Idempotency:** query `paymentEvents` by `by_provider_event` index where provider=wompi, providerEventId=transactionId. If found, return early.
2. **Parse reference:** split by `_` → `["sub", orgId, tier, timestamp]`
3. **Query subscription** by organization
4. **If APPROVED:**
   - Existing sub → patch: status=active, currentPeriodStart=now, currentPeriodEnd=now+30days, updatedAt=now
   - No sub → insert full subscription record (provider=wompi, currency=COP, etc)
5. **If DECLINED/ERROR:**
   - Existing sub → patch: status=past_due
6. **Always:** insert `paymentEvents` audit record

Edge cases:

- Handle missing/malformed reference gracefully
- Don't crash on unknown status values
- Period is +30 days (not calendar month) for simplicity

## Resources

- [Wompi Transaction Statuses](https://docs.wompi.co/en/docs/colombia/eventos/)

## Definition of Done

- [ ] Mutation exported from `convex/subscriptions.ts`
- [ ] Idempotent: duplicate webhook calls are no-ops
- [ ] Creates subscription on first APPROVED payment
- [ ] Updates existing subscription on renewal APPROVED
- [ ] Marks past_due on DECLINED/ERROR
- [ ] Audit log entry always created
- [ ] Reference parsing handles edge cases
