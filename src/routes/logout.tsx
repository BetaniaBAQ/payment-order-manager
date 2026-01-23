import { createFileRoute, redirect } from '@tanstack/react-router'

import { signOut } from '@workos/authkit-tanstack-react-start'

export const Route = createFileRoute('/logout')({
  preload: false,
  loader: async () => {
    try {
      await signOut()
    } catch {
      // Session may already be invalidated on WorkOS side
      // Redirect to home anyway
      throw redirect({ to: '/' })
    }
  },
})
