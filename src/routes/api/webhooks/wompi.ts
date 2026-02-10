import { createFileRoute } from '@tanstack/react-router'

import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { verifyWompiSignature } from '@/lib/wompi'


const convex = new ConvexHttpClient(process.env.CONVEX_URL ?? '')

export const Route = createFileRoute('/api/webhooks/wompi')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()

        const event = body.data
        const signature = body.signature

        const isValid = verifyWompiSignature({
          transactionId: event.transaction.id,
          status: event.transaction.status,
          amountInCents: event.transaction.amount_in_cents,
          timestamp: body.timestamp,
          signature: signature.checksum,
        })

        if (!isValid) {
          return new Response(JSON.stringify({ error: 'Invalid signature' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        await convex.mutation(api.subscriptions.handleWompiEvent, {
          reference: event.transaction.reference,
          status: event.transaction.status,
          transactionId: event.transaction.id,
          paymentMethod: event.transaction.payment_method_type,
          amountInCents: event.transaction.amount_in_cents,
        })

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
