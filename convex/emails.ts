'use node'

import { v } from 'convex/values'
import { Resend } from '@convex-dev/resend'

import { render } from '@react-email/render'

import { components, internal } from './_generated/api'
import { internalAction } from './_generated/server'
import { DevAlertEmail } from './emails/devAlert'
import { DocumentAddedEmail } from './emails/documentAdded'
import { OrderApprovedEmail } from './emails/orderApproved'
import { OrderCancelledEmail } from './emails/orderCancelled'
import { OrderCreatedEmail } from './emails/orderCreated'
import { OrderNeedsSupportEmail } from './emails/orderNeedsSupport'
import { OrderRejectedEmail } from './emails/orderRejected'
import { PaymentFailedEmail } from './emails/paymentFailed'
import { PaymentReminderEmail } from './emails/paymentReminder'
import { TIER_LABELS } from './lib/tierLimits'
import {
  billingNotificationTypeValidator,
  orderNotificationTypeValidator,
} from './schema/notifications'
import type { Id } from './_generated/dataModel'
import type {
  BillingNotificationType,
  OrderNotificationType,
} from './schema/notifications'

const APP_URL = process.env.VITE_APP_URL ?? 'http://localhost:3000'
const EMAIL_FROM = 'Betania <noreply@notifications.biobetania.com>'

export const resend: InstanceType<typeof Resend> = new Resend(
  components.resend,
  {
    onEmailEvent: internal.emailsInternal.handleEmailEvent,
    testMode: false,
  },
)

// Shared context passed to all email handlers
type EmailContext = {
  order: {
    _id: Id<'paymentOrders'>
    title: string
    reason: string
    currency: string
    amount: number
  }
  creator: { name: string; email: string } | null
  owner: { name: string; email: string } | null
  orderUrl: string
  amount: string // formatted
  comment?: string
  documentName?: string
  actorName?: string
}

type EmailResult = {
  to: string
  subject: string
  html: string
} | null

// Email handlers mapped by order notification type
const emailHandlers: Record<
  OrderNotificationType,
  (ctx: EmailContext) => Promise<EmailResult>
> = {
  ORDER_CREATED: async ({ owner, creator, order, amount, orderUrl }) => {
    if (!owner?.email) return null
    return {
      to: owner.email,
      subject: `New payment order: ${order.title}`,
      html: await render(
        OrderCreatedEmail({
          creatorName: creator?.name ?? 'Unknown',
          orderTitle: order.title,
          amount,
          reason: order.reason,
          orderUrl,
        }),
      ),
    }
  },

  ORDER_APPROVED: async ({ creator, order, amount, comment, orderUrl }) => {
    if (!creator?.email) return null
    return {
      to: creator.email,
      subject: `Approved: ${order.title}`,
      html: await render(
        OrderApprovedEmail({
          orderTitle: order.title,
          amount,
          comment,
          orderUrl,
        }),
      ),
    }
  },

  ORDER_REJECTED: async ({ creator, order, comment, orderUrl }) => {
    if (!creator?.email) return null
    return {
      to: creator.email,
      subject: `Rejected: ${order.title}`,
      html: await render(
        OrderRejectedEmail({
          orderTitle: order.title,
          reason: comment ?? 'No reason provided',
          orderUrl,
        }),
      ),
    }
  },

  ORDER_NEEDS_SUPPORT: async ({ creator, order, comment, orderUrl }) => {
    if (!creator?.email) return null
    return {
      to: creator.email,
      subject: `Action required: ${order.title}`,
      html: await render(
        OrderNeedsSupportEmail({
          orderTitle: order.title,
          comment: comment ?? 'Please provide additional documents',
          orderUrl,
        }),
      ),
    }
  },

  ORDER_CANCELLED: async ({ owner, creator, order, actorName, orderUrl }) => {
    if (!owner?.email) return null
    return {
      to: owner.email,
      subject: `Cancelled: ${order.title}`,
      html: await render(
        OrderCancelledEmail({
          orderTitle: order.title,
          cancelledBy: actorName ?? creator?.name ?? 'Unknown',
          orderUrl,
        }),
      ),
    }
  },

  DOCUMENT_ADDED: async ({ owner, creator, order, documentName, orderUrl }) => {
    if (!owner?.email) return null
    return {
      to: owner.email,
      subject: `New document for: ${order.title}`,
      html: await render(
        DocumentAddedEmail({
          orderTitle: order.title,
          documentName: documentName ?? 'Document',
          uploadedBy: creator?.name ?? 'Unknown',
          orderUrl,
        }),
      ),
    }
  },
}

export const send = internalAction({
  args: {
    type: orderNotificationTypeValidator,
    paymentOrderId: v.id('paymentOrders'),
    comment: v.optional(v.string()),
    documentName: v.optional(v.string()),
    actorId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    // Fetch notification data
    const data = await ctx.runQuery(internal.emailsInternal.getData, {
      paymentOrderId: args.paymentOrderId,
    })

    if (!data) {
      console.error('Email send failed: could not fetch notification data', {
        paymentOrderId: args.paymentOrderId,
      })
      return
    }

    const { order, profile, creator, owner, org } = data

    if (!profile || !org) {
      console.error('Email send failed: missing profile or org')
      return
    }

    // Get actor name for cancelled notifications
    let actorName: string | undefined
    if (args.actorId) {
      const actor = await ctx.runQuery(internal.emailsInternal.getUser, {
        userId: args.actorId,
      })
      actorName = actor?.name
    }

    // Build email context
    const emailContext: EmailContext = {
      order,
      creator: creator ? { name: creator.name, email: creator.email } : null,
      owner: owner ? { name: owner.name, email: owner.email } : null,
      orderUrl: `${APP_URL}/orgs/${org.slug}/profiles/${profile.slug}/orders/${order._id}`,
      amount: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: order.currency,
      }).format(order.amount),
      comment: args.comment,
      documentName: args.documentName,
      actorName,
    }

    // Get handler for this notification type and render email
    const handler = emailHandlers[args.type]
    const result = await handler(emailContext)
    if (!result) {
      console.error('Email send failed: missing recipient email', {
        type: args.type,
      })
      return
    }

    // Send email
    await resend.sendEmail(ctx, {
      from: EMAIL_FROM,
      to: result.to,
      subject: result.subject,
      html: result.html,
    })

    console.log('Email sent:', { type: args.type, to: result.to })
  },
})

const DEV_EMAIL = 'crdemar@gmail.com'

// Send alert to dev for missing email configurations
export const sendDevAlert = internalAction({
  args: {
    subject: v.string(),
    orderId: v.id('paymentOrders'),
    fromStatus: v.string(),
    toStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const html = await render(
      DevAlertEmail({
        subject: args.subject,
        orderId: args.orderId,
        fromStatus: args.fromStatus,
        toStatus: args.toStatus,
        timestamp: new Date().toISOString(),
      }),
    )

    await resend.sendEmail(ctx, {
      from: EMAIL_FROM,
      to: DEV_EMAIL,
      subject: `[DEV] ${args.subject}`,
      html,
    })

    console.log('Dev alert sent:', { subject: args.subject, to: DEV_EMAIL })
  },
})

// --- Billing Email Handlers ---

type BillingEmailContext = {
  orgName: string
  planName: string
  ownerEmail: string
  billingUrl: string
  expiryDate?: string
  errorMessage?: string
}

type BillingEmailResult = {
  to: string
  subject: string
  html: string
}

const billingEmailHandlers: Record<
  BillingNotificationType,
  (ctx: BillingEmailContext) => Promise<BillingEmailResult>
> = {
  PAYMENT_REMINDER: async ({
    orgName,
    planName,
    expiryDate,
    ownerEmail,
    billingUrl,
  }) => ({
    to: ownerEmail,
    subject: 'Tu suscripción vence pronto - renueva tu plan',
    html: await render(
      PaymentReminderEmail({
        orgName,
        planName,
        expiryDate: expiryDate ?? '',
        renewUrl: billingUrl,
      }),
    ),
  }),

  PAYMENT_FAILED: async ({
    orgName,
    planName,
    errorMessage,
    ownerEmail,
    billingUrl,
  }) => ({
    to: ownerEmail,
    subject: 'Pago fallido - actualiza tu método de pago',
    html: await render(
      PaymentFailedEmail({
        orgName,
        planName,
        errorMessage,
        billingUrl,
      }),
    ),
  }),
}

export const sendBillingEmail = internalAction({
  args: {
    type: billingNotificationTypeValidator,
    subscriptionId: v.id('subscriptions'),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const data = await ctx.runQuery(internal.emailsInternal.getBillingData, {
      subscriptionId: args.subscriptionId,
    })

    if (!data) {
      console.error('Billing email failed: could not fetch data', {
        subscriptionId: args.subscriptionId,
      })
      return
    }

    const { subscription, org, owner } = data

    if (!owner?.email) {
      console.error('Billing email failed: no owner email', {
        subscriptionId: args.subscriptionId,
      })
      return
    }

    const planName = TIER_LABELS[subscription.tier]
    const billingUrl = `${APP_URL}/orgs/${org.slug}/settings/billing`

    const emailContext: BillingEmailContext = {
      orgName: org.name,
      planName,
      ownerEmail: owner.email,
      billingUrl,
      expiryDate: new Date(subscription.currentPeriodEnd).toLocaleDateString(
        'es-CO',
        { year: 'numeric', month: 'long', day: 'numeric' },
      ),
      errorMessage: args.errorMessage,
    }

    const handler = billingEmailHandlers[args.type]
    const result = await handler(emailContext)

    await resend.sendEmail(ctx, {
      from: EMAIL_FROM,
      to: result.to,
      subject: result.subject,
      html: result.html,
    })

    console.log('Billing email sent:', { type: args.type, to: result.to })
  },
})
