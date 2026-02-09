# Billing Implementation: Wompi + Stripe

Colombia-first billing. Wompi for local payments (PSE, Nequi, tarjetas), Stripe for international.

## Architecture

```
Customer country = CO → Wompi (PSE, Nequi, Bancolombia, tarjetas locales)
Customer country != CO → Stripe (tarjetas internacionales, Stripe Billing)

Both → Convex subscription record (provider-agnostic)
Both → Webhooks → Convex HTTP actions → sync subscription state
```

---

## 1. Convex Schema Changes

### New table: `subscriptions`

```typescript
// convex/schema/subscriptions.ts

import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const subscriptions = defineTable({
  organizationId: v.id('organizations'),
  tier: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')),
  billingInterval: v.union(v.literal('monthly'), v.literal('annual')),

  // Provider-agnostic
  paymentProvider: v.union(
    v.literal('wompi'),
    v.literal('stripe'),
    v.literal('none'), // free tier
  ),
  providerCustomerId: v.optional(v.string()), // Wompi: N/A, Stripe: cus_xxx
  providerSubscriptionId: v.optional(v.string()), // Wompi: N/A, Stripe: sub_xxx
  providerPaymentSourceId: v.optional(v.string()), // Wompi: tokenized card source ID

  // Billing state
  status: v.union(
    v.literal('active'),
    v.literal('past_due'),
    v.literal('cancelled'),
    v.literal('pending_payment'), // Wompi PSE: waiting for bank redirect
  ),
  currency: v.string(), // "COP" or "USD"
  amountPerPeriod: v.number(), // in smallest unit: centavos (COP) or cents (USD)

  // Period tracking
  currentPeriodStart: v.number(), // timestamp ms
  currentPeriodEnd: v.number(), // timestamp ms

  // Usage tracking (reset monthly)
  ordersUsedThisMonth: v.number(),
  storageUsedBytes: v.number(),
  emailsSentThisMonth: v.number(),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  cancelledAt: v.optional(v.number()),
})
  .index('by_organization', ['organizationId'])
  .index('by_provider_customer', ['paymentProvider', 'providerCustomerId'])
  .index('by_status', ['status'])
```

### New table: `paymentEvents`

Audit log for all billing events (webhook deliveries, payment attempts, failures).

```typescript
// convex/schema/paymentEvents.ts

export const paymentEvents = defineTable({
  subscriptionId: v.id('subscriptions'),
  provider: v.union(v.literal('wompi'), v.literal('stripe')),
  eventType: v.string(), // "payment.success", "payment.failed", "subscription.cancelled"
  providerEventId: v.optional(v.string()), // idempotency
  amount: v.optional(v.number()),
  currency: v.optional(v.string()),
  paymentMethod: v.optional(v.string()), // "pse", "nequi", "card", "bancolombia"
  metadata: v.optional(v.any()),
  createdAt: v.number(),
})
  .index('by_subscription', ['subscriptionId'])
  .index('by_provider_event', ['provider', 'providerEventId'])
```

### Register in schema index

```typescript
// convex/schema/index.ts - add to existing exports
export { subscriptions } from './subscriptions'
export { paymentEvents } from './paymentEvents'
```

---

## 2. Tier Limits

```typescript
// convex/lib/tierLimits.ts

export const TIER_LIMITS = {
  free: {
    orders: 10,
    storageMB: 500,
    users: 3,
    profiles: 1,
    emails: 50,
    historyMonths: 3,
  },
  pro: {
    orders: 200,
    storageMB: 20_480, // 20 GB
    users: Infinity,
    profiles: 10,
    emails: 2_000,
    historyMonths: 24,
  },
  enterprise: {
    orders: 1_000,
    storageMB: 102_400, // 100 GB
    users: Infinity,
    profiles: Infinity,
    emails: 10_000,
    historyMonths: 60,
  },
} as const

export type Tier = keyof typeof TIER_LIMITS

export const TIER_PRICES = {
  free: { cop: 0, usd: 0 },
  pro: { cop: 199_000_00, usd: 49_00 }, // centavos COP, cents USD
  enterprise: { cop: 599_000_00, usd: 149_00 },
} as const

export const ANNUAL_DISCOUNT = 0.2 // 20% off
```

---

## 3. Limit Checking (Convex mutations)

```typescript
// convex/lib/checkLimits.ts

import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { TIER_LIMITS, type Tier } from './tierLimits'

export async function getSubscription(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
) {
  return ctx.db
    .query('subscriptions')
    .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
    .unique()
}

export async function checkOrderLimit(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
) {
  const sub = await getSubscription(ctx, organizationId)
  const tier: Tier = sub?.tier ?? 'free'
  const limits = TIER_LIMITS[tier]
  const used = sub?.ordersUsedThisMonth ?? 0

  return {
    allowed: used < limits.orders,
    remaining: Math.max(0, limits.orders - used),
    limit: limits.orders,
    tier,
  }
}

export async function checkProfileLimit(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
) {
  const sub = await getSubscription(ctx, organizationId)
  const tier: Tier = sub?.tier ?? 'free'
  const limits = TIER_LIMITS[tier]

  const profiles = await ctx.db
    .query('paymentOrderProfiles')
    .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
    .collect()

  return {
    allowed: profiles.length < limits.profiles,
    remaining: Math.max(0, limits.profiles - profiles.length),
    limit: limits.profiles,
    tier,
  }
}

export async function checkMemberLimit(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
) {
  const sub = await getSubscription(ctx, organizationId)
  const tier: Tier = sub?.tier ?? 'free'
  const limits = TIER_LIMITS[tier]

  const members = await ctx.db
    .query('organizationMemberships')
    .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
    .collect()

  return {
    allowed: members.length < limits.users,
    remaining:
      limits.users === Infinity
        ? Infinity
        : Math.max(0, limits.users - members.length),
    limit: limits.users,
    tier,
  }
}

export async function incrementOrderUsage(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
) {
  const sub = await getSubscription(ctx, organizationId)
  if (!sub) return
  await ctx.db.patch(sub._id, {
    ordersUsedThisMonth: sub.ordersUsedThisMonth + 1,
    updatedAt: Date.now(),
  })
}
```

### Integrate into existing `paymentOrders.create`

Add limit check at the top of the existing create mutation in `convex/paymentOrders.ts`:

```typescript
// In paymentOrders.create, after access check, before creating order:
const profile = await ctx.db.get(args.profileId)
const orderLimit = await checkOrderLimit(ctx, profile.organizationId)
if (!orderLimit.allowed) {
  throw new ConvexError({
    code: 'LIMIT_REACHED',
    message: `Plan ${orderLimit.tier} limit: ${orderLimit.limit} orders/month`,
    tier: orderLimit.tier,
    limit: orderLimit.limit,
  })
}
// ... create order ...
await incrementOrderUsage(ctx, profile.organizationId)
```

Same pattern for `paymentOrderProfiles.create` and `organizationMemberships.addMember`.

---

## 4. Wompi Integration (Colombia)

### Environment variables

```bash
# Wompi
WOMPI_PUBLIC_KEY=pub_test_xxx          # Frontend checkout widget
WOMPI_PRIVATE_KEY=prv_test_xxx         # Backend API calls
WOMPI_EVENTS_SECRET=test_events_xxx    # Webhook signature verification
WOMPI_INTEGRITY_SECRET=test_integrity_xxx  # Transaction integrity hash
```

### Wompi client

```typescript
// src/lib/wompi.ts

const WOMPI_API =
  process.env.NODE_ENV === 'production'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1'

export async function createWompiTransaction(params: {
  amountInCents: number // COP centavos
  currency: 'COP'
  customerEmail: string
  reference: string // unique, e.g. "sub_<orgId>_<timestamp>"
  paymentMethod: 'CARD' | 'PSE' | 'NEQUI' | 'BANCOLOMBIA_TRANSFER'
  redirectUrl: string
  paymentSourceId?: string // for tokenized card recurring
}) {
  const response = await fetch(`${WOMPI_API}/transactions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount_in_cents: params.amountInCents,
      currency: params.currency,
      customer_email: params.customerEmail,
      reference: params.reference,
      payment_method: { type: params.paymentMethod },
      redirect_url: params.redirectUrl,
      payment_source_id: params.paymentSourceId,
    }),
  })

  return response.json()
}

export async function getWompiPSEBanks() {
  const response = await fetch(`${WOMPI_API}/pse/financial_institutions`, {
    headers: { Authorization: `Bearer ${process.env.WOMPI_PUBLIC_KEY}` },
  })
  return response.json()
}

export async function tokenizeCard(params: {
  number: string
  cvc: string
  expMonth: string
  expYear: string
  cardHolder: string
}) {
  const response = await fetch(`${WOMPI_API}/tokens/cards`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WOMPI_PUBLIC_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
  return response.json() // { data: { id: "tok_xxx", ... } }
}

export async function createPaymentSource(params: {
  type: 'CARD'
  token: string
  customerEmail: string
  acceptanceToken: string
}) {
  const response = await fetch(`${WOMPI_API}/payment_sources`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: params.type,
      token: params.token,
      customer_email: params.customerEmail,
      acceptance_token: params.acceptanceToken,
    }),
  })
  return response.json() // { data: { id: 12345, ... } }
}

export function verifyWompiSignature(params: {
  transactionId: string
  status: string
  amountInCents: number
  timestamp: number
  signature: string
}): boolean {
  const crypto = require('crypto')
  const seed = `${params.transactionId}${params.status}${params.amountInCents}${params.timestamp}${process.env.WOMPI_EVENTS_SECRET}`
  const hash = crypto.createHash('sha256').update(seed).digest('hex')
  return hash === params.signature
}
```

### Wompi payment flows

**Flow A: Card subscription (auto-debit, preferred)**

1. User enters card in checkout → tokenize via `POST /tokens/cards`
2. Create payment source via `POST /payment_sources` (stores card for recurring)
3. Charge immediately via `POST /transactions` with `payment_source_id`
4. Store `paymentSourceId` in subscription record
5. Monthly: cron triggers `POST /transactions` with same `payment_source_id`

**Flow B: PSE (manual each month)**

1. User selects PSE → get bank list via `GET /pse/financial_institutions`
2. Create transaction with `payment_method.type = "PSE"` + bank details
3. User redirected to bank portal → completes payment → redirected back
4. Webhook confirms payment → activate subscription
5. Monthly: send email with new PSE payment link (via Resend)

**Flow C: Nequi (push notification)**

1. User enters Nequi phone number
2. Create transaction with `payment_method.type = "NEQUI"` + phone
3. User approves push notification in Nequi app
4. Webhook confirms → activate subscription
5. Monthly: create new transaction, Nequi sends push notification

---

## 5. Stripe Integration (International)

### Environment variables

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_ANNUAL=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
STRIPE_PRICE_ENTERPRISE_ANNUAL=price_xxx
```

### Stripe client

```typescript
// src/lib/stripe.ts

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-01-27.acacia',
})

export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL ?? '',
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? '',
  enterprise_annual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL ?? '',
} as const
```

### Stripe payment flow

1. User clicks upgrade → server creates Stripe Checkout Session
2. Redirect to Stripe hosted checkout
3. After payment → webhook `checkout.session.completed`
4. Create/update Convex subscription record
5. Renewals handled automatically by Stripe Billing
6. Stripe Customer Portal for managing payment methods, invoices, cancellation

---

## 6. Webhook Handlers

### Wompi webhook

```typescript
// src/routes/api/webhooks/wompi.ts
// TanStack Start API route

import { json } from '@tanstack/react-start'

import { api } from 'convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'

import { verifyWompiSignature } from '@/lib/wompi'

const convex = new ConvexHttpClient(process.env.CONVEX_URL ?? '')

export async function POST({ request }: { request: Request }) {
  const body = await request.json()

  // Verify signature
  const event = body.data
  const signature = body.signature
  const isValid = verifyWompiSignature({
    transactionId: event.transaction.id,
    status: event.transaction.status,
    amountInCents: event.transaction.amount_in_cents,
    timestamp: body.timestamp,
    signature: signature.checksum,
  })

  if (!isValid) return json({ error: 'Invalid signature' }, { status: 401 })

  // Parse reference to get org ID: "sub_<orgId>_<timestamp>"
  const reference = event.transaction.reference
  const status = event.transaction.status // APPROVED, DECLINED, VOIDED, ERROR

  await convex.mutation(api.subscriptions.handleWompiEvent, {
    reference,
    status,
    transactionId: event.transaction.id,
    paymentMethod: event.transaction.payment_method_type,
    amountInCents: event.transaction.amount_in_cents,
  })

  return json({ ok: true })
}
```

### Stripe webhook

```typescript
// src/routes/api/webhooks/stripe.ts

import { json } from '@tanstack/react-start'

import { api } from 'convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'

import { stripe } from '@/lib/stripe'

const convex = new ConvexHttpClient(process.env.CONVEX_URL ?? '')

export async function POST({ request }: { request: Request }) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? '',
    )
  } catch {
    return json({ error: 'Invalid signature' }, { status: 400 })
  }

  const handlers: Record<string, (data: any) => Promise<void>> = {
    'checkout.session.completed': async (session) => {
      await convex.mutation(api.subscriptions.handleStripeCheckout, {
        sessionId: session.id,
        customerId: session.customer,
        subscriptionId: session.subscription,
        organizationId: session.metadata.organizationId,
        tier: session.metadata.tier,
      })
    },
    'customer.subscription.updated': async (sub) => {
      await convex.mutation(api.subscriptions.handleStripeSubscriptionUpdate, {
        stripeSubscriptionId: sub.id,
        status: sub.status,
        currentPeriodStart: sub.current_period_start * 1000,
        currentPeriodEnd: sub.current_period_end * 1000,
      })
    },
    'customer.subscription.deleted': async (sub) => {
      await convex.mutation(api.subscriptions.handleStripeSubscriptionDeleted, {
        stripeSubscriptionId: sub.id,
      })
    },
    'invoice.payment_failed': async (invoice) => {
      await convex.mutation(api.subscriptions.handlePaymentFailed, {
        stripeSubscriptionId: invoice.subscription,
        provider: 'stripe',
      })
    },
  }

  const handler = handlers[event.type]
  if (handler) await handler(event.data.object)

  return json({ ok: true })
}
```

---

## 7. Convex Subscription Mutations

```typescript
// convex/subscriptions.ts

import { v } from 'convex/values'

import { internalMutation, mutation, query } from './_generated/server'
import { TIER_LIMITS, type Tier } from './lib/tierLimits'

// --- Queries ---

export const getByOrganization = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query('subscriptions')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .unique()

    const tier: Tier = sub?.tier ?? 'free'
    const limits = TIER_LIMITS[tier]

    return {
      subscription: sub,
      tier,
      limits,
      usage: {
        orders: sub?.ordersUsedThisMonth ?? 0,
        storageMB: Math.round((sub?.storageUsedBytes ?? 0) / 1024 / 1024),
        emails: sub?.emailsSentThisMonth ?? 0,
      },
    }
  },
})

// --- Mutations for webhook handlers ---

export const handleWompiEvent = mutation({
  args: {
    reference: v.string(),
    status: v.string(),
    transactionId: v.string(),
    paymentMethod: v.string(),
    amountInCents: v.number(),
  },
  handler: async (ctx, args) => {
    // Idempotency: check if event already processed
    const existing = await ctx.db
      .query('paymentEvents')
      .withIndex('by_provider_event', (q) =>
        q.eq('provider', 'wompi').eq('providerEventId', args.transactionId),
      )
      .unique()
    if (existing) return

    // Parse reference: "sub_<orgId>_<tier>_<timestamp>"
    const parts = args.reference.split('_')
    const organizationId = parts[1] as any // Id<'organizations'>
    const tier = parts[2] as Tier

    const sub = await ctx.db
      .query('subscriptions')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', organizationId),
      )
      .unique()

    const now = Date.now()

    if (args.status === 'APPROVED') {
      if (sub) {
        await ctx.db.patch(sub._id, {
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000, // +30 days
          updatedAt: now,
        })
      } else {
        await ctx.db.insert('subscriptions', {
          organizationId,
          tier,
          billingInterval: 'monthly',
          paymentProvider: 'wompi',
          status: 'active',
          currency: 'COP',
          amountPerPeriod: args.amountInCents,
          currentPeriodStart: now,
          currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000,
          ordersUsedThisMonth: 0,
          storageUsedBytes: 0,
          emailsSentThisMonth: 0,
          createdAt: now,
          updatedAt: now,
        })
      }
    }

    if (args.status === 'DECLINED' || args.status === 'ERROR') {
      if (sub) {
        await ctx.db.patch(sub._id, { status: 'past_due', updatedAt: now })
      }
    }

    // Log event
    await ctx.db.insert('paymentEvents', {
      subscriptionId: sub?._id ?? ('' as any),
      provider: 'wompi',
      eventType: `payment.${args.status.toLowerCase()}`,
      providerEventId: args.transactionId,
      amount: args.amountInCents,
      currency: 'COP',
      paymentMethod: args.paymentMethod,
      createdAt: now,
    })
  },
})

export const handleStripeCheckout = mutation({
  args: {
    sessionId: v.string(),
    customerId: v.string(),
    subscriptionId: v.string(),
    organizationId: v.string(),
    tier: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = args.organizationId as any
    const tier = args.tier as Tier
    const now = Date.now()

    const existing = await ctx.db
      .query('subscriptions')
      .withIndex('by_organization', (q) => q.eq('organizationId', orgId))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        tier,
        paymentProvider: 'stripe',
        providerCustomerId: args.customerId,
        providerSubscriptionId: args.subscriptionId,
        status: 'active',
        updatedAt: now,
      })
    } else {
      await ctx.db.insert('subscriptions', {
        organizationId: orgId,
        tier,
        billingInterval: 'monthly',
        paymentProvider: 'stripe',
        providerCustomerId: args.customerId,
        providerSubscriptionId: args.subscriptionId,
        status: 'active',
        currency: 'USD',
        amountPerPeriod: 0, // Stripe manages this
        currentPeriodStart: now,
        currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000,
        ordersUsedThisMonth: 0,
        storageUsedBytes: 0,
        emailsSentThisMonth: 0,
        createdAt: now,
        updatedAt: now,
      })
    }
  },
})

export const handleStripeSubscriptionUpdate = mutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query('subscriptions')
      .withIndex('by_provider_customer', (q) =>
        q.eq('paymentProvider', 'stripe'),
      )
      .filter((q) =>
        q.eq(q.field('providerSubscriptionId'), args.stripeSubscriptionId),
      )
      .unique()

    if (!sub) return

    const statusMap: Record<string, string> = {
      active: 'active',
      past_due: 'past_due',
      canceled: 'cancelled',
      unpaid: 'past_due',
    }

    await ctx.db.patch(sub._id, {
      status: (statusMap[args.status] ?? 'active') as any,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      updatedAt: Date.now(),
    })
  },
})

export const handleStripeSubscriptionDeleted = mutation({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query('subscriptions')
      .withIndex('by_provider_customer', (q) =>
        q.eq('paymentProvider', 'stripe'),
      )
      .filter((q) =>
        q.eq(q.field('providerSubscriptionId'), args.stripeSubscriptionId),
      )
      .unique()

    if (!sub) return

    await ctx.db.patch(sub._id, {
      tier: 'free',
      status: 'cancelled',
      cancelledAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

export const handlePaymentFailed = mutation({
  args: {
    stripeSubscriptionId: v.optional(v.string()),
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    // Find subscription and mark as past_due
    // Send notification email via existing Resend integration
  },
})
```

---

## 8. Monthly Cron Jobs

```typescript
// convex/crons.ts

import { cronJobs } from 'convex/server'

import { internal } from './_generated/api'

const crons = cronJobs()

// Reset monthly usage counters on the 1st of each month
crons.monthly(
  'reset usage counters',
  { day: 1, hourUTC: 5, minuteUTC: 0 },
  internal.subscriptions.resetMonthlyUsage,
)

// Charge Wompi recurring subscriptions (card tokenized)
crons.monthly(
  'wompi recurring charges',
  { day: 1, hourUTC: 12, minuteUTC: 0 },
  internal.subscriptions.chargeWompiRecurring,
)

// Send PSE/Nequi payment reminders (3 days before period end)
crons.daily(
  'payment reminders',
  { hourUTC: 14, minuteUTC: 0 },
  internal.subscriptions.sendPaymentReminders,
)

export default crons
```

```typescript
// convex/subscriptions.ts (internal mutations for crons)

export const resetMonthlyUsage = internalMutation({
  handler: async (ctx) => {
    const activeSubs = await ctx.db
      .query('subscriptions')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect()

    for (const sub of activeSubs) {
      await ctx.db.patch(sub._id, {
        ordersUsedThisMonth: 0,
        emailsSentThisMonth: 0,
        updatedAt: Date.now(),
      })
    }
  },
})

export const chargeWompiRecurring = internalMutation({
  handler: async (ctx) => {
    // Find active Wompi subscriptions with tokenized cards
    // where currentPeriodEnd is in the past
    const now = Date.now()
    const wompiSubs = await ctx.db
      .query('subscriptions')
      .filter((q) =>
        q.and(
          q.eq(q.field('paymentProvider'), 'wompi'),
          q.eq(q.field('status'), 'active'),
          q.neq(q.field('providerPaymentSourceId'), undefined),
          q.lt(q.field('currentPeriodEnd'), now),
        ),
      )
      .collect()

    // For each, schedule an HTTP action to charge via Wompi API
    for (const sub of wompiSubs) {
      await ctx.scheduler.runAfter(
        0,
        internal.subscriptions.chargeWompiSubscription,
        {
          subscriptionId: sub._id,
        },
      )
    }
  },
})

export const sendPaymentReminders = internalMutation({
  handler: async (ctx) => {
    const now = Date.now()
    const threeDaysFromNow = now + 3 * 24 * 60 * 60 * 1000

    // Find PSE/Nequi subscriptions expiring in ~3 days
    const expiringSubs = await ctx.db
      .query('subscriptions')
      .filter((q) =>
        q.and(
          q.eq(q.field('paymentProvider'), 'wompi'),
          q.eq(q.field('status'), 'active'),
          q.eq(q.field('providerPaymentSourceId'), undefined), // no saved card = PSE/Nequi
          q.lt(q.field('currentPeriodEnd'), threeDaysFromNow),
          q.gt(q.field('currentPeriodEnd'), now),
        ),
      )
      .collect()

    // Send reminder emails with payment link via existing Resend integration
    for (const sub of expiringSubs) {
      await ctx.scheduler.runAfter(0, internal.emails.send, {
        type: 'PAYMENT_REMINDER',
        subscriptionId: sub._id,
      })
    }
  },
})
```

---

## 9. Provider Router (Server function)

```typescript
// src/lib/billing.ts

import { createServerFn } from '@tanstack/react-start'

import { TIER_PRICES } from 'convex/lib/tierLimits'

import { stripe, STRIPE_PRICES } from './stripe'

export const createCheckoutSession = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      organizationId: string
      tier: 'pro' | 'enterprise'
      country: string
      interval: 'monthly' | 'annual'
    }) => data,
  )
  .handler(async ({ data }) => {
    // Colombia → Wompi
    if (data.country === 'CO') {
      return {
        provider: 'wompi' as const,
        // Return data needed for Wompi checkout widget on client
        amountInCents:
          data.interval === 'annual'
            ? Math.round(TIER_PRICES[data.tier].cop * 12 * (1 - 0.2))
            : TIER_PRICES[data.tier].cop,
        currency: 'COP',
        reference: `sub_${data.organizationId}_${data.tier}_${Date.now()}`,
      }
    }

    // International → Stripe Checkout
    const priceKey =
      `${data.tier}_${data.interval}` as keyof typeof STRIPE_PRICES
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: STRIPE_PRICES[priceKey], quantity: 1 }],
      success_url: `${process.env.APP_URL}/settings?billing=success`,
      cancel_url: `${process.env.APP_URL}/settings?billing=cancelled`,
      metadata: {
        organizationId: data.organizationId,
        tier: data.tier,
      },
    })

    return {
      provider: 'stripe' as const,
      checkoutUrl: session.url,
    }
  })

export const createCustomerPortalSession = createServerFn({ method: 'POST' })
  .validator((data: { stripeCustomerId: string }) => data)
  .handler(async ({ data }) => {
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripeCustomerId,
      return_url: `${process.env.APP_URL}/settings`,
    })
    return { url: session.url }
  })
```

---

## 10. UI Components

### Pricing page (`/pricing`)

```
src/routes/pricing.tsx                     # Public pricing page
src/components/billing/pricing-cards.tsx    # 3-tier comparison cards
src/components/billing/pricing-toggle.tsx   # Monthly/Annual toggle
```

- Show COP prices if detected country = CO, USD otherwise
- Toggle between monthly/annual (show savings)
- Free: "Comenzar gratis" → redirect to signup
- Pro/Enterprise: "Comenzar" → checkout flow (Wompi or Stripe)

### Upgrade flow

```
src/components/billing/upgrade-modal.tsx    # Triggered when approaching limits
src/components/billing/wompi-checkout.tsx   # Wompi payment form (PSE bank selector, Nequi phone, card)
```

- Wompi checkout: inline form with payment method tabs (Nequi preferred → Card → PSE)
- Stripe checkout: redirect to Stripe hosted page

### Settings billing tab

```
src/components/billing/billing-settings.tsx  # Plan info + usage
src/components/billing/usage-meters.tsx      # Progress bars for orders, storage, emails
```

- Current plan and status
- Usage meters (orders used / limit, storage, emails)
- Payment method on file
- Next billing date
- Upgrade/downgrade buttons
- Manage billing (Stripe Customer Portal or Wompi card management)

### Limit warning banners

```
src/components/billing/limit-banner.tsx     # "2 orders remaining" warning
```

- Show when usage > 80% of limit
- Show blocking message when limit reached
- CTA to upgrade

---

## 11. Files to Create/Modify

### New files

| File                                          | Purpose                                           |
| --------------------------------------------- | ------------------------------------------------- |
| `convex/schema/subscriptions.ts`              | Subscriptions table schema                        |
| `convex/schema/paymentEvents.ts`              | Payment events audit log schema                   |
| `convex/subscriptions.ts`                     | Subscription queries, mutations, webhook handlers |
| `convex/lib/tierLimits.ts`                    | Tier config constants                             |
| `convex/lib/checkLimits.ts`                   | Limit checking helpers                            |
| `convex/crons.ts`                             | Monthly reset, recurring charges, reminders       |
| `src/lib/wompi.ts`                            | Wompi API client                                  |
| `src/lib/stripe.ts`                           | Stripe client + price IDs                         |
| `src/lib/billing.ts`                          | Provider router server functions                  |
| `src/routes/pricing.tsx`                      | Public pricing page                               |
| `src/routes/api/webhooks/wompi.ts`            | Wompi webhook handler                             |
| `src/routes/api/webhooks/stripe.ts`           | Stripe webhook handler                            |
| `src/components/billing/pricing-cards.tsx`    | Tier comparison cards                             |
| `src/components/billing/pricing-toggle.tsx`   | Monthly/annual toggle                             |
| `src/components/billing/upgrade-modal.tsx`    | Upgrade prompt modal                              |
| `src/components/billing/wompi-checkout.tsx`   | Wompi payment form                                |
| `src/components/billing/billing-settings.tsx` | Settings billing tab                              |
| `src/components/billing/usage-meters.tsx`     | Usage progress bars                               |
| `src/components/billing/limit-banner.tsx`     | Limit warning banner                              |

### Modified files

| File                                                | Change                                                           |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| `convex/schema/index.ts`                            | Export new tables                                                |
| `convex/paymentOrders.ts`                           | Add `checkOrderLimit` + `incrementOrderUsage` to create mutation |
| `convex/paymentOrderProfiles.ts`                    | Add `checkProfileLimit` to create mutation                       |
| `convex/organizationMemberships.ts`                 | Add `checkMemberLimit` to addMember mutation                     |
| `convex/emails.ts`                                  | Add `PAYMENT_REMINDER` email type                                |
| `convex/emails/base.tsx`                            | Add payment reminder email template                              |
| `src/routes/_authenticated/orgs/$slug/settings.tsx` | Add "Billing" tab                                                |

---

## 12. Fee Impact Summary

### Wompi (Colombia) - Plan Avanzado Agregador

| Method            | Fee                | On Pro ($199K COP) | On Enterprise ($599K COP) |
| ----------------- | ------------------ | ------------------ | ------------------------- |
| Nequi/Bancolombia | 1.50% + $700 + IVA | $4,385 (2.2%)      | $11,525 (1.9%)            |
| Tarjetas          | 1.99% + $700 + IVA | $5,545 (2.8%)      | $15,018 (2.5%)            |
| PSE               | 2.69% + $700 + IVA | $7,203 (3.6%)      | $20,007 (3.3%)            |

### Stripe (International)

| Fee                         | On Pro ($49 USD) | On Enterprise ($149 USD) |
| --------------------------- | ---------------- | ------------------------ |
| 2.9% + $0.30 + 0.5% Billing | $1.96 (4.0%)     | $5.36 (3.6%)             |

### Net margin per customer (worst case)

|             | Pro                    | Enterprise             |
| ----------- | ---------------------- | ---------------------- |
| Wompi (PSE) | ~$192K COP net (96.4%) | ~$579K COP net (96.7%) |
| Stripe      | ~$47 USD net (96.0%)   | ~$144 USD net (96.4%)  |

**No price adjustments needed.**

---

## 13. Testing

### Wompi sandbox

- Public key: `pub_test_xxx`
- Card approved: `4242 4242 4242 4242` (any future exp, 3-digit CVC)
- Card declined: `4111 1111 1111 1111`
- PSE test bank: "Banco que rechaza" → returns REJECTED
- PSE approved: any other test bank → returns APPROVED

### Stripe test mode

- Card approved: `4242 4242 4242 4242`
- Card declined: `4000 0000 0000 0002`
- Webhook testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
