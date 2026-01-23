import { createFileRoute } from '@tanstack/react-router'

import { handleCallbackRoute } from '@workos/authkit-tanstack-react-start'
import { api } from 'convex/_generated/api'

import { convexClient } from '@/lib/convex-server'

export const Route = createFileRoute('/api/auth/callback')({
  server: {
    handlers: {
      GET: handleCallbackRoute({
        onSuccess: async ({ user }) => {
          // Sync WorkOS user to Convex
          await convexClient.mutation(api.users.getOrCreate, {
            authKitId: user.id,
            email: user.email,
            name: user.firstName || user.email.split('@')[0] || user.email,
          })
        },
      }),
    },
  },
})
