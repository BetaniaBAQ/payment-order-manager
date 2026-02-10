import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { getAuth, getSignInUrl } from '@workos/authkit-tanstack-react-start'
import { api } from 'convex/_generated/api'
import { convexQuery } from '@convex-dev/react-query'

import { useSyncPreferences } from '@/hooks/use-sync-preferences'

export const Route = createFileRoute('/_authenticated')({
  loader: async ({ context, location }) => {
    const { user: workosUser } = await getAuth()
    if (!workosUser) {
      const signInUrl = await getSignInUrl({
        data: { returnPathname: location.pathname },
      })
      throw redirect({ href: signInUrl })
    }

    // Prefetch user via reactive Convex client
    const user = await context.queryClient.ensureQueryData(
      convexQuery(api.users.getByAuthKitId, { authKitId: workosUser.id }),
    )

    if (!user) {
      // User should exist from auth callback, redirect to sign in if not
      const signInUrl = await getSignInUrl({
        data: { returnPathname: location.pathname },
      })
      throw redirect({ href: signInUrl })
    }

    return { authKitId: workosUser.id }
  },
  component: AuthenticatedLayout,
})

function SyncPreferences({ children }: { children: React.ReactNode }) {
  useSyncPreferences()
  return children
}

function AuthenticatedLayout() {
  return (
    <SyncPreferences>
      <Outlet />
    </SyncPreferences>
  )
}
