# 0022: Cron - send payment reminders (PSE/Nequi)

## Context

Daily cron that sends email reminders to PSE/Nequi subscribers 3 days before their subscription period ends. These users must manually pay each month (no auto-debit). Email includes a payment link.

## Dependencies

- 0020 (crons.ts exists)
- 0023 (PAYMENT_REMINDER email template)

## Files

- `convex/crons.ts` (add cron)
- `convex/subscriptions.ts` (add internalMutation)

## Requirements

**crons.ts — add:**

```typescript
crons.daily(
  'payment reminders',
  { hourUTC: 14, minuteUTC: 0 },
  internal.subscriptions.sendPaymentReminders,
)
```

14:00 UTC = 09:00 COT

**subscriptions.ts — add:**
`sendPaymentReminders` internalMutation:

1. Calculate `threeDaysFromNow = Date.now() + 3 * 24 * 60 * 60 * 1000`
2. Query subscriptions where:
   - paymentProvider = wompi
   - status = active
   - providerPaymentSourceId = undefined (no saved card → PSE/Nequi user)
   - currentPeriodEnd > now AND currentPeriodEnd < threeDaysFromNow
3. For each, schedule email: `ctx.scheduler.runAfter(0, internal.emails.send, { type: 'PAYMENT_REMINDER', subscriptionId: sub._id })`

Avoid duplicate reminders: could add `lastReminderSentAt` field to subscription, or rely on email dedup in emails.ts.

## Resources

- Existing email system: `convex/emails.ts`, `convex/emails/base.tsx`

## Definition of Done

- [ ] Cron registered in crons.ts
- [ ] Finds PSE/Nequi subs expiring in 3 days
- [ ] Only targets subs WITHOUT saved card
- [ ] Schedules reminder email for each
- [ ] Runs daily at 09:00 COT
