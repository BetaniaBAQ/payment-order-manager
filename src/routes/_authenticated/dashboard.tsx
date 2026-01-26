import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, getRouteApi } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'

import { SettingsButton } from '@/components/dashboard/settings-button'
import { AppHeader } from '@/components/shared/app-header'
import { EmptyState } from '@/components/shared/empty-state'
import { List } from '@/components/shared/list'
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
            <List
              items={organizations}
              keyExtractor={(org) => org._id}
              searchExtractor={(org) => org.name}
              searchPlaceholder="Search organizations..."
              renderItem={(org) => (
                <Link
                  to="/orgs/$slug"
                  params={{ slug: org.slug }}
                  className="hover:bg-muted/50 flex flex-1 items-center justify-between rounded-md py-1 pr-2 transition-colors"
                >
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-muted-foreground text-sm">/{org.slug}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {org.membership.role}
                  </Badge>
                </Link>
              )}
              renderActions={(org) => {
                const canManage =
                  org.membership.role === 'owner' ||
                  org.membership.role === 'admin'
                return canManage ? <SettingsButton slug={org.slug} /> : null
              }}
              emptyState={
                <EmptyState
                  title="No organizations yet"
                  description="Create an organization to start managing payment orders"
                />
              }
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
