import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, getRouteApi, redirect } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

import { EMPTY_STATE } from '@/constants/organization'

import { SettingsButton } from '@/components/dashboard/settings-button'
import { AppHeader } from '@/components/shared/app-header'
import { EmptyState } from '@/components/shared/empty-state'
import { List } from '@/components/shared/list'
import { ListItemLink } from '@/components/shared/list-item-link'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/hooks/use-user'
import { isOwnerOrAdmin } from '@/lib/auth'
import { HOME_BREADCRUMB, ROUTES } from '@/lib/constants'
import { convexQuery } from '@/lib/convex'

const authRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute('/_authenticated/orgs/$slug/')({
  loader: async ({ context, params }) => {
    const org = await context.queryClient.ensureQueryData(
      convexQuery(api.organizations.getBySlug, { slug: params.slug }),
    )

    if (!org) {
      throw redirect({ to: ROUTES.dashboard })
    }

    return { org }
  },
  component: OrganizationDashboard,
  pendingComponent: PageSkeleton,
})

function OrganizationDashboard() {
  const { authKitId } = authRoute.useLoaderData()
  const { slug } = Route.useParams()

  const { data: org } = useSuspenseQuery(
    convexQuery(api.organizations.getBySlug, { slug }),
  )

  const currentUser = useUser()

  const orgId = org?._id ?? ('' as Id<'organizations'>)

  const { data: memberRole } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getMemberRole, {
      organizationId: orgId,
      authKitId,
    }),
  )

  const { data: profiles } = useSuspenseQuery(
    convexQuery(api.paymentOrderProfiles.getByOrganization, {
      organizationId: orgId,
    }),
  )

  if (!org) {
    return null
  }

  const isOrgAdminOrOwner = isOwnerOrAdmin(memberRole)

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader breadcrumbs={[HOME_BREADCRUMB, { label: org.name }]}>
        {memberRole && (
          <Badge variant="secondary" className="capitalize">
            {memberRole}
          </Badge>
        )}
      </AppHeader>

      <main id="main-content" className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          {isOrgAdminOrOwner && <SettingsButton slug={slug} size="large" />}
          <div>
            <h1 className="text-2xl font-bold">{org.name}</h1>
            <p className="text-muted-foreground">
              Manage payment order profiles for this organization
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Order Profiles</CardTitle>
            <CardDescription>
              Profiles define how payment orders are submitted and processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <List
              items={profiles}
              keyExtractor={(profile) => profile._id}
              searchExtractor={(profile) => profile.name}
              searchPlaceholder="Search profiles..."
              renderItem={(profile) => (
                <ListItemLink
                  to={ROUTES.profile}
                  params={{ slug, profileSlug: profile.slug }}
                >
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {profile.paymentOrderCount} payment order
                      {profile.paymentOrderCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </ListItemLink>
              )}
              renderActions={(profile) => {
                const isProfileOwner = currentUser?._id === profile.ownerId
                const canManageProfile = isProfileOwner || isOrgAdminOrOwner
                return canManageProfile ? (
                  <SettingsButton slug={slug} profileSlug={profile.slug} />
                ) : null
              }}
              emptyState={<EmptyState title={EMPTY_STATE.profiles.title} />}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
