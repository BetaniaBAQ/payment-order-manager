import { useSuspenseQuery } from '@tanstack/react-query'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'

import { AppHeader } from '@/components/shared/app-header'
import { HOME_BREADCRUMB, ROUTES } from '@/lib/constants'
import { convexQuery } from '@/lib/convex'

export const Route = createFileRoute(
  '/_authenticated/orgs/$slug/profiles/$profileSlug/_profile-settings',
)({
  loader: async ({ context, params }) => {
    const profile = await context.queryClient.ensureQueryData(
      convexQuery(api.paymentOrderProfiles.getBySlug, {
        orgSlug: params.slug,
        profileSlug: params.profileSlug,
      }),
    )

    if (!profile) {
      throw redirect({ to: ROUTES.org, params: { slug: params.slug } })
    }

    return { profile }
  },
  component: ProfileSettingsLayout,
})

function ProfileSettingsLayout() {
  const { slug, profileSlug } = Route.useParams()
  const { data: profile } = useSuspenseQuery(
    convexQuery(api.paymentOrderProfiles.getBySlug, {
      orgSlug: slug,
      profileSlug,
    }),
  )

  if (!profile) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        breadcrumbs={[
          HOME_BREADCRUMB,
          {
            label: profile.organization.name,
            to: ROUTES.org,
            params: { slug },
          },
          {
            label: profile.name,
            to: ROUTES.profile,
            params: { slug, profileSlug },
          },
          { label: 'Settings' },
        ]}
      />
      <main id="main-content" className="container mx-auto flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Profile Settings</h1>
        <Outlet />
      </main>
    </div>
  )
}
