# 0007: Implement recurring billing (`chargeWompiSubscription`)

## Context

The cron infrastructure exists: `chargeWompiRecurring` (1st of month, 12:00 UTC) finds active Wompi subs with saved cards (`providerPaymentSourceId`) past their billing period, then schedules `chargeWompiSubscription` for each. The action itself is a TODO stub. The webhook handler (`handleWompiEvent`) already handles APPROVED/DECLINED statuses.

## Dependencies

- wompi-0004 (webhook verification must work correctly first)

## Files

- `convex/subscriptions.ts` (edit — implement `chargeWompiSubscription` handler, add `markPastDueAndNotify` internalMutation)

## Requirements

### Implement `chargeWompiSubscription` handler

The internalAction at line 337 currently just logs. Replace with:

1. **Query data**: `ctx.runQuery(internal.emailsInternal.getBillingData, { subscriptionId })` — returns `{ subscription, org, owner }` with owner email
2. **Guards**: Exit early if no `providerPaymentSourceId` or no owner email
3. **Build reference**: `sub_${sub.organizationId}_${sub.tier}_${Date.now()}`
4. **Call Wompi API via `fetch`** (can't import `src/lib/wompi.ts` — Convex runtime ≠ Node.js):

   ```typescript
   const WOMPI_API =
     process.env.NODE_ENV === 'production'
       ? 'https://production.wompi.co/v1'
       : 'https://sandbox.wompi.co/v1'

   const response = await fetch(`${WOMPI_API}/transactions`, {
     method: 'POST',
     headers: {
       Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       amount_in_cents: sub.amountPerPeriod,
       currency: 'COP',
       customer_email: owner.email,
       reference,
       payment_method: { type: 'CARD' },
       payment_source_id: sub.providerPaymentSourceId,
     }),
   })
   ```

5. **On success** (`response.ok` + `result.data.id`): Log transaction ID. Webhook handles the rest.
6. **On failure** (API error or network failure): Call `markPastDueAndNotify` internalMutation.

### Add `markPastDueAndNotify` internalMutation

Can't call `handlePaymentFailed` (public mutation) from internalAction via `internal.*`. Create a dedicated internalMutation:

```typescript
export const markPastDueAndNotify = internalMutation({
  args: { subscriptionId: v.id('subscriptions') },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get('subscriptions', args.subscriptionId)
    if (!sub) return

    await ctx.db.patch('subscriptions', sub._id, {
      status: 'past_due',
      updatedAt: Date.now(),
    })

    await ctx.scheduler.runAfter(0, internal.emails.sendBillingEmail, {
      type: 'PAYMENT_FAILED',
      subscriptionId: sub._id,
    })
  },
})
```

### Environment variable

`WOMPI_PRIVATE_KEY` must be set in the **Convex dashboard** environment variables (Settings → Environment Variables), not just in `.env.local`. The Convex runtime reads env vars from its own config.

## Definition of Done

- [ ] `chargeWompiSubscription` queries subscription via `getBillingData`
- [ ] Guards: exits early if no `providerPaymentSourceId` or no owner email
- [ ] Calls Wompi API via `fetch` with correct payload
- [ ] Reference format: `sub_{orgId}_{tier}_{timestamp}`
- [ ] On API failure: marks sub `past_due`, schedules `PAYMENT_FAILED` email
- [ ] On success: logs transaction ID (webhook handles final status)
- [ ] `markPastDueAndNotify` internalMutation created
- [ ] `WOMPI_PRIVATE_KEY` documented as required in Convex environment
- [ ] No TypeScript errors
