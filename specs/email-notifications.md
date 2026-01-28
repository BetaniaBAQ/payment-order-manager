# Email Notifications Specification

## Overview

Transactional email notifications for payment order lifecycle events using `@convex-dev/resend` component with React Email templates.

## Architecture

```
Mutation (create/updateStatus)
    │
    └─► ctx.scheduler.runAfter(0, internal.emails.send, { type, orderId })
           │
           └─► Node Action: render React Email → resend.sendEmail()
                  │
                  └─► Resend API → Webhook → handleEmailEvent()
```

## Dependencies

```bash
pnpm add @convex-dev/resend @react-email/components @react-email/render
```

## Notification Events

| Event                 | Trigger                                     | Recipient     | Subject                      |
| --------------------- | ------------------------------------------- | ------------- | ---------------------------- |
| `ORDER_CREATED`       | Payment order created                       | Profile owner | "New payment order: {title}" |
| `ORDER_APPROVED`      | Status → APPROVED                           | Order creator | "Approved: {title}"          |
| `ORDER_REJECTED`      | Status → REJECTED                           | Order creator | "Rejected: {title}"          |
| `ORDER_NEEDS_SUPPORT` | Status → NEEDS_SUPPORT                      | Order creator | "Action required: {title}"   |
| `ORDER_CANCELLED`     | Status → CANCELLED                          | Profile owner | "Cancelled: {title}"         |
| `DOCUMENT_ADDED`      | Document uploaded (IN_REVIEW/NEEDS_SUPPORT) | Profile owner | "New document for: {title}"  |

## Files Structure

```
convex/
├── convex.config.ts       # Register @convex-dev/resend component
├── http.ts                # Webhook endpoint for delivery tracking
├── emails.ts              # Email sending action + data query
└── emails/                # React Email templates
    ├── base.tsx           # Shared layout component
    ├── order-created.tsx
    ├── order-approved.tsx
    ├── order-rejected.tsx
    ├── order-needs-support.tsx
    ├── order-cancelled.tsx
    └── document-added.tsx
```

## Environment Variables (Convex Dashboard)

| Variable                | Description            | Required                    |
| ----------------------- | ---------------------- | --------------------------- |
| `RESEND_API_KEY`        | Resend API key         | Yes (already configured)    |
| `RESEND_WEBHOOK_SECRET` | Webhook signing secret | Yes (for delivery tracking) |

## Resend Dashboard Setup

1. Go to Resend → Webhooks → Add Webhook
2. URL: `https://<deployment>.convex.site/resend-webhook`
3. Events: Select all (delivered, bounced, complained)
4. Copy signing secret → Set as `RESEND_WEBHOOK_SECRET`

## Email Template Design

- **Layout**: Minimal, professional, responsive
- **Components**: React Email (`@react-email/components`)
- **Styling**: Tailwind via `<Tailwind>` component
- **Colors**: Status-specific accents (green=approved, yellow=needs support)
- **CTA**: Button linking to order detail page

## Integration Points

### `convex/paymentOrders.ts`

**`create` mutation** - After history insert:

```typescript
await ctx.scheduler.runAfter(0, internal.emails.send, {
  type: 'ORDER_CREATED',
  paymentOrderId: orderId,
})
```

**`updateStatus` mutation** - After history insert:

```typescript
const notificationTypes = {
  APPROVED: 'ORDER_APPROVED',
  REJECTED: 'ORDER_REJECTED',
  NEEDS_SUPPORT: 'ORDER_NEEDS_SUPPORT',
  CANCELLED: 'ORDER_CANCELLED',
}
// Schedule if applicable
```

### `convex/paymentOrderDocuments.ts`

**`create` mutation** - After document insert (only IN_REVIEW/NEEDS_SUPPORT):

```typescript
await ctx.scheduler.runAfter(0, internal.emails.send, {
  type: 'DOCUMENT_ADDED',
  paymentOrderId: args.paymentOrderId,
  documentName: args.name,
})
```

## Key Features

- **Non-blocking**: Uses `scheduler.runAfter(0, ...)` for async delivery
- **Durable**: Convex workpools ensure eventual delivery
- **Idempotent**: Component prevents duplicate sends on retries
- **Rate-limited**: Respects Resend API limits
- **Tracked**: Webhook captures delivery status (delivered, bounced, etc.)

## Testing

1. Dev mode: `testMode: true` sends to test addresses only
2. Resend dashboard shows all sent emails
3. Webhook events logged via `handleEmailEvent`

## Out of Scope (Future)

- Notification preferences table (`notificationPreferences`)
- User-configurable email opt-out UI
- Email templates for organization invites (migrate existing inline HTML)
