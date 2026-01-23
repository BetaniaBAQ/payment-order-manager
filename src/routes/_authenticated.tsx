import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { getAuth, getSignInUrl } from '@workos/authkit-tanstack-react-start'
import { api } from 'convex/_generated/api'

import { convexClient } from '@/lib/convex-server'

export const Route = createFileRoute('/_authenticated')({
  loader: async ({ location }) => {
    const { user: workosUser } = await getAuth()
    if (!workosUser) {
      const signInUrl = await getSignInUrl({
        data: { returnPathname: location.pathname },
      })
      throw redirect({ href: signInUrl })
    }

    // Fetch user from Convex
    const user = await convexClient.query(api.users.getByAuthKitId, {
      authKitId: workosUser.id,
    })

    if (!user) {
      // User should exist from auth callback, redirect to sign in if not
      const signInUrl = await getSignInUrl({
        data: { returnPathname: location.pathname },
      })
      throw redirect({ href: signInUrl })
    }

    return { user }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return <Outlet />
}
