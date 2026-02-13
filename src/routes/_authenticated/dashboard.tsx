import { createFileRoute, redirect } from '@tanstack/react-router'

import { getAuth } from '@workos/authkit-tanstack-react-start'
import { api } from 'convex/_generated/api'

import { ROUTES } from '@/lib/constants'
import { convexQuery } from '@/lib/convex'

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: async ({ context }) => {
    const { user: workosUser } = await getAuth()
    const authKitId = workosUser?.id ?? ''

    const [user, organizations] = await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.users.getByAuthKitId, { authKitId }),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.organizationMemberships.getByUser, { authKitId }),
      ),
    ])

    // Try to redirect to last selected org
    if (user?.lastSelectedOrgId) {
      const lastOrg = await context.queryClient.ensureQueryData(
        convexQuery(api.organizations.getById, { id: user.lastSelectedOrgId }),
      )
      if (lastOrg) {
        throw redirect({ to: ROUTES.org, params: { slug: lastOrg.slug } })
      }
    }

    // Fall back to first org
    const firstOrg = organizations[0]
    if (firstOrg) {
      throw redirect({
        to: ROUTES.org,
        params: { slug: firstOrg.slug },
      })
    }

    // No orgs at all — send to create one
    throw redirect({ to: ROUTES.newOrg })
  },
  component: () => null,
})
