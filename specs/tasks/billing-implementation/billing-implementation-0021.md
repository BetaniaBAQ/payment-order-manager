# 0021: Cron - charge Wompi recurring (tokenized cards)

## Context

Monthly cron that auto-charges Wompi subscriptions with saved card (payment source). Only for users who tokenized their card. PSE/Nequi users get reminders instead (0022).

## Dependencies

- 0020 (crons.ts exists)
- 0010 (createWompiTransaction)

## Files

- `convex/crons.ts` (add cron)
- `convex/subscriptions.ts` (add internalMutation + httpAction)

## Requirements

**crons.ts — add:**

```typescript
crons.monthly(
  'wompi recurring charges',
  { day: 1, hourUTC: 12, minuteUTC: 0 },
  internal.subscriptions.chargeWompiRecurring,
)
```

12:00 UTC = 07:00 COT

**subscriptions.ts — add internalMutation:**
`chargeWompiRecurring`:

1. Query subscriptions where: paymentProvider=wompi, status=active, providerPaymentSourceId exists (not undefined), currentPeriodEnd < now
2. For each, schedule `chargeWompiSubscription` via `ctx.scheduler.runAfter(0, ...)`

**subscriptions.ts — add httpAction (or internalAction):**
`chargeWompiSubscription({ subscriptionId })`:

1. Get subscription by ID
2. Get organization for email
3. Call `createWompiTransaction({ amountInCents: sub.amountPerPeriod, currency: 'COP', customerEmail, reference: "sub_{orgId}_{tier}_{timestamp}", paymentMethod: 'CARD', redirectUrl: APP_URL, paymentSourceId: sub.providerPaymentSourceId })`
4. Wompi webhook (0013/0015) handles the result

Note: must be `internalAction` (not mutation) since it calls external API via fetch.

## Resources

- [Convex Actions](https://docs.convex.dev/functions/actions) (for external API calls)
- [Wompi Recurring with Payment Source](https://docs.wompi.co/en/docs/colombia/fuentes-de-pago/)

## Definition of Done

- [ ] Cron registered in crons.ts
- [ ] `chargeWompiRecurring` finds expired tokenized-card subs
- [ ] `chargeWompiSubscription` calls Wompi API with saved payment source
- [ ] Uses `internalAction` for external API call
- [ ] Only charges subs with saved card (providerPaymentSourceId defined)
