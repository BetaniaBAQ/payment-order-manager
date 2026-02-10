import { createFileRoute } from '@tanstack/react-router'

import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { stripe } from '@/lib/stripe'


const convex = new ConvexHttpClient(process.env.CONVEX_URL ?? '')

type WebhookHandler = (data: Record<string, any>) => Promise<void>

const handlers: Record<string, WebhookHandler> = {
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

export const Route = createFileRoute('/api/webhooks/stripe')({
  server: {
    handlers: {
      POST: async ({ request }) => {
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
          return new Response(JSON.stringify({ error: 'Invalid signature' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const handler = handlers[event.type]
        if (handler) {
          await handler(event.data.object as Record<string, any>)
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
