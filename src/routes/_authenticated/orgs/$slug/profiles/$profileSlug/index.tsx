import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, getRouteApi, redirect } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'

import { SettingsButton } from '@/components/dashboard/settings-button'
import { AppHeader } from '@/components/shared/app-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/hooks/use-user'
import { convexQuery } from '@/lib/convex'

const authRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute(
  '/_authenticated/orgs/$slug/profiles/$profileSlug/',
)({
  loader: async ({ context, params }) => {
    const profile = await context.queryClient.ensureQueryData(
      convexQuery(api.paymentOrderProfiles.getBySlug, {
        orgSlug: params.slug,
        profileSlug: params.profileSlug,
      }),
    )

    if (!profile) {
      throw redirect({ to: '/orgs/$slug', params: { slug: params.slug } })
    }

    return { profile }
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { authKitId } = authRoute.useLoaderData()
  const { slug, profileSlug } = Route.useParams()

  const { data: profile } = useSuspenseQuery(
    convexQuery(api.paymentOrderProfiles.getBySlug, {
      orgSlug: slug,
      profileSlug,
    }),
  )

  const currentUser = useUser()

  const { data: memberRole } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getMemberRole, {
      organizationId: profile?.organization._id ?? ('' as never),
      authKitId,
    }),
  )

  if (!profile) {
    return null
  }

  const isProfileOwner = currentUser?._id === profile.owner?._id
  const isOrgAdminOrOwner = memberRole === 'owner' || memberRole === 'admin'
  const canManageProfile = isProfileOwner || isOrgAdminOrOwner

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        breadcrumbs={[
          { label: 'Betania', to: '/dashboard' },
          {
            label: profile.organization.name,
            to: '/orgs/$slug',
            params: { slug },
          },
          { label: profile.name },
        ]}
      >
        {profile.isPublic ? (
          <Badge variant="secondary">Public</Badge>
        ) : (
          <Badge variant="outline">Private</Badge>
        )}
      </AppHeader>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          {canManageProfile && (
            <SettingsButton
              slug={slug}
              profileSlug={profileSlug}
              size="large"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">
              View and submit payment orders
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Orders</CardTitle>
            <CardDescription>
              Payment orders submitted to this profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No payment orders yet"
              description="Payment orders will appear here once submitted"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
