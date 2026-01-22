import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    // Convex
    CONVEX_DEPLOYMENT: z.string().min(1).optional(),
    // WorkOS AuthKit
    WORKOS_API_KEY: z.string().min(1).optional(),
    WORKOS_CLIENT_ID: z.string().min(1).optional(),
    WORKOS_REDIRECT_URI: z.url().optional(),
    WORKOS_COOKIE_PASSWORD: z.string().min(32).optional(),
    // Resend
    RESEND_API_KEY: z.string().min(1).optional(),
    // UploadThing
    UPLOADTHING_TOKEN: z.string().min(1).optional(),
  },

  clientPrefix: 'VITE_',

  client: {
    VITE_CONVEX_URL: z.url(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    WORKOS_API_KEY: process.env.WORKOS_API_KEY,
    WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID,
    WORKOS_REDIRECT_URI: process.env.WORKOS_REDIRECT_URI,
    WORKOS_COOKIE_PASSWORD: process.env.WORKOS_COOKIE_PASSWORD,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    VITE_CONVEX_URL: import.meta.env.VITE_CONVEX_URL,
  },

  emptyStringAsUndefined: true,
})
