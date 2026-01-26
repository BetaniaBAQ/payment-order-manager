import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, getRouteApi } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'

import { AppHeader } from '@/components/app-header'
import { SettingsButton } from '@/components/dashboard/settings-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { authKitId } = authRoute.useLoaderData()
  const user = useUser()

  const { data: organizations } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getByUser, { authKitId }),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader breadcrumbs={[{ label: 'Betania', to: '/dashboard' }]} />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">
            Manage your organizations and payment orders
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>Organizations you belong to</CardDescription>
            </div>
            <Button
              nativeButton={false}
              render={(props) => (
                <Link {...props} to="/orgs/new">
                  + New Organization
                </Link>
              )}
            />
          </CardHeader>
          <CardContent>
            {organizations.length > 0 ? (
              <div className="divide-y">
                {organizations.map((org) => {
                  const canManage =
                    org.membership.role === 'owner' ||
                    org.membership.role === 'admin'

                  return (
                    <div
                      key={org._id}
                      className="-mx-2 flex items-center justify-between rounded-md px-2 py-4 first:pt-0 last:pb-0"
                    >
                      <Link
                        to="/orgs/$slug"
                        params={{ slug: org.slug }}
                        className="hover:bg-muted/50 flex flex-1 items-center justify-between rounded-md py-1 pr-2 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-muted-foreground text-sm">
                            /{org.slug}
                          </p>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {org.membership.role}
                        </Badge>
                      </Link>
                      {canManage && <SettingsButton slug={org.slug} />}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  You're not a member of any organizations yet
                </p>
                <p className="text-muted-foreground text-sm">
                  Create an organization to start managing payment orders
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
