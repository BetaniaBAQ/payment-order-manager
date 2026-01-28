import { httpRouter } from 'convex/server'

import { httpAction } from './_generated/server'
import { resend } from './emails'

const http = httpRouter()

// Resend webhook for email delivery status tracking
http.route({
  path: '/resend-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    return await resend.handleResendEventWebhook(ctx, req)
  }),
})

export default http
