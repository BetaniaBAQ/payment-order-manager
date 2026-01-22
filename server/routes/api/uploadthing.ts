import { defineEventHandler, getRequestURL } from 'h3'
import { createRouteHandler } from 'uploadthing/server'

import { uploadRouter } from '../../../src/lib/uploadthing'
import type { H3Event } from 'h3'

const handler = createRouteHandler({ router: uploadRouter })

export default defineEventHandler(async (event: H3Event) => {
  const url = getRequestURL(event)
  const method = event.req.method
  const headers = Object.fromEntries(event.req.headers.entries())
  const body =
    method !== 'GET' && method !== 'HEAD' ? event.req.body : undefined

  const request = new Request(url, {
    method,
    headers,
    body,
    // @ts-expect-error - duplex is needed for streaming bodies
    duplex: body ? 'half' : undefined,
  })

  return handler(request)
})
