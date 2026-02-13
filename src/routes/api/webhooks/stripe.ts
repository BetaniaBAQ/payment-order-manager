import { createFileRoute } from '@tanstack/react-router'

import { api } from '../../../../convex/_generated/api'
import { convexClient } from '@/lib/convex-server'
import { getStripe } from '@/lib/stripe'


type WebhookHandler = (data: Record<string, any>) => Promise<void>

const handlers: Record<string, WebhookHandler> = {
  'checkout.session.completed': async (session) => {
    await convexClient.mutation(api.subscriptions.handleStripeCheckout, {
      sessionId: session.id,
      customerId: session.customer,
      subscriptionId: session.subscription,
      organizationId: session.metadata.organizationId,
      tier: session.metadata.tier,
    })
  },
  'customer.subscription.updated': async (sub) => {
    await convexClient.mutation(
      api.subscriptions.handleStripeSubscriptionUpdate,
      {
        stripeSubscriptionId: sub.id,
        status: sub.status,
        currentPeriodStart: sub.current_period_start * 1000,
        currentPeriodEnd: sub.current_period_end * 1000,
      },
    )
  },
  'customer.subscription.deleted': async (sub) => {
    await convexClient.mutation(
      api.subscriptions.handleStripeSubscriptionDeleted,
      {
        stripeSubscriptionId: sub.id,
      },
    )
  },
  'invoice.payment_failed': async (invoice) => {
    await convexClient.mutation(api.subscriptions.handlePaymentFailed, {
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
          event = getStripe().webhooks.constructEvent(
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
