import { createFileRoute } from '@tanstack/react-router'

import { createRouteHandler } from 'uploadthing/server'

import { env } from '@/lib/env'
import { uploadRouter } from '@/lib/uploadthing'

const handler = createRouteHandler({
  router: uploadRouter,
  config: {
    token: env.UPLOADTHING_TOKEN,
  },
})

export const Route = createFileRoute('/api/uploadthing')({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request),
    },
  },
})
