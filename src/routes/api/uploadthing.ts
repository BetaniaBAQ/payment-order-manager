import { createRouteHandler } from 'uploadthing/server'
import { createFileRoute } from '@tanstack/react-router'
import { uploadRouter } from '@/lib/uploadthing'
import { env } from '@/lib/env'

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
