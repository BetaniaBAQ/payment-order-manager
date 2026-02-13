import { createFileRoute } from '@tanstack/react-router'

import { api } from '../../../../convex/_generated/api'
import { convexClient } from '@/lib/convex-server'
import { verifyWompiSignature } from '@/lib/wompi'


export const Route = createFileRoute('/api/webhooks/wompi')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()

        // Verify signature using dynamic properties from Wompi
        const isValid = verifyWompiSignature({
          data: body.data,
          signature: body.signature,
          timestamp: body.timestamp,
        })

        if (!isValid) {
          return new Response(JSON.stringify({ error: 'Invalid signature' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const tx = body.data.transaction
        await convexClient.mutation(api.subscriptions.handleWompiEvent, {
          reference: tx.reference,
          status: tx.status,
          transactionId: tx.id,
          paymentMethod: tx.payment_method_type,
          amountInCents: tx.amount_in_cents,
        })

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
