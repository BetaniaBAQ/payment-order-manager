import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  getRouteApi,
  redirect,
} from '@tanstack/react-router'

import { api } from 'convex/_generated/api'

import { AppHeader } from '@/components/app-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { convexQuery } from '@/lib/convex'

const authRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute('/_authenticated/orgs/$slug')({
  loader: async ({ context, params }) => {
    const org = await context.queryClient.ensureQueryData(
      convexQuery(api.organizations.getBySlug, { slug: params.slug }),
    )

    if (!org) {
      throw redirect({ to: '/dashboard' })
    }

    return { org }
  },
  component: OrganizationDashboard,
})

function OrganizationDashboard() {
  const { authKitId } = authRoute.useLoaderData()
  const { slug } = Route.useParams()

  const { data: org } = useSuspenseQuery(
    convexQuery(api.organizations.getBySlug, { slug }),
  )

  const { data: memberRole } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getMemberRole, {
      organizationId: org?._id ?? ('' as never),
      authKitId,
    }),
  )

  const { data: profiles } = useSuspenseQuery(
    convexQuery(api.paymentOrderProfiles.getByOrganization, {
      organizationId: org?._id ?? ('' as never),
    }),
  )

  if (!org) {
    return null
  }

  const canManage = memberRole === 'owner' || memberRole === 'admin'

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        breadcrumbs={[
          { label: 'Betania', to: '/dashboard' },
          { label: org.name },
        ]}
      >
        {memberRole && (
          <Badge variant="secondary" className="capitalize">
            {memberRole}
          </Badge>
        )}
        {canManage && (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={(props) => (
              <Link {...props} to="/orgs/$slug/settings" params={{ slug }}>
                Settings
              </Link>
            )}
          />
        )}
      </AppHeader>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{org.name}</h1>
            <p className="text-muted-foreground">
              Manage payment order profiles for this organization
            </p>
          </div>
          {memberRole && (
            <Button
              nativeButton={false}
              render={(props) => (
                <Link
                  {...props}
                  to="/orgs/$slug/profiles/new"
                  params={{ slug }}
                >
                  + Create Profile
                </Link>
              )}
            />
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Order Profiles</CardTitle>
            <CardDescription>
              Profiles define how payment orders are submitted and processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profiles.length > 0 ? (
              <div className="divide-y">
                {profiles.map((profile) => (
                  <Link
                    key={profile._id}
                    to="/orgs/$slug/profiles/$profileSlug"
                    params={{ slug, profileSlug: profile.slug }}
                    className="hover:bg-muted/50 -mx-2 flex items-center justify-between rounded-md px-2 py-4 transition-colors first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{profile.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {profile.paymentOrderCount} payment order
                        {profile.paymentOrderCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {profile.isPublic ? (
                        <Badge variant="secondary">Public</Badge>
                      ) : (
                        <Badge variant="outline">Private</Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        Settings
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No payment order profiles yet
                </p>
                <p className="text-muted-foreground text-sm">
                  Create a profile to start receiving payment orders
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
