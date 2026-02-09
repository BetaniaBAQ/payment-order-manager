# 0023: Payment reminder + failed email templates

## Context

Add billing-related email templates to existing React Email + Resend email system. Two templates: payment reminder (before expiry) and payment failed (after failed charge).

## Dependencies

- 0009 (subscription data for template context)

## Files

- `convex/emails.ts` (modify — add new notification types)
- `convex/emails/base.tsx` (modify — add new email templates)

## Requirements

**Add to notification types** in `convex/emails.ts`:

- `PAYMENT_REMINDER` — triggered by cron 0022
- `PAYMENT_FAILED` — triggered by mutation 0019

**PAYMENT_REMINDER template:**

- Subject: "Tu suscripcion vence pronto - renueva tu plan"
- Body: plan name (Pro/Enterprise), expiry date formatted, CTA button "Renovar ahora" linking to payment page, footer "Si ya pagaste, ignora este email"

**PAYMENT_FAILED template:**

- Subject: "Pago fallido - actualiza tu metodo de pago"
- Body: plan name, error context, CTA button "Actualizar pago" linking to billing settings, support contact info

Both templates:

- Use existing `base.tsx` layout/components
- Follow existing email patterns in the codebase
- Spanish language (target market Colombia)
- Include org name in greeting

## Resources

- Existing email system: `convex/emails.ts`, `convex/emails/base.tsx`
- Existing notification types: ORDER_CREATED, ORDER_APPROVED, ORDER_REJECTED, etc
- [React Email Components](https://react.email/docs/components/html)

## Definition of Done

- [ ] Both notification types registered in emails.ts
- [ ] Both templates render in React Email
- [ ] Templates include: plan name, date, CTA button, org name
- [ ] Spanish text
- [ ] Follow existing email template patterns
- [ ] `internal.emails.send({ type: 'PAYMENT_REMINDER', subscriptionId })` works
