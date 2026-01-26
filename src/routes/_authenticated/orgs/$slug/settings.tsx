import { useSuspenseQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  getRouteApi,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

import {
  GeneralSettings,
  MembersSettings,
} from '@/components/organization-settings'
import { AppHeader } from '@/components/shared/app-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/hooks/use-user'
import { isOwnerOrAdmin } from '@/lib/auth'
import { convexQuery } from '@/lib/convex'

const authRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute('/_authenticated/orgs/$slug/settings')({
  loader: async ({ context, params }) => {
    const org = await context.queryClient.ensureQueryData(
      convexQuery(api.organizations.getBySlug, { slug: params.slug }),
    )

    if (!org) {
      throw redirect({ to: '/dashboard' })
    }

    return { org }
  },
  component: OrganizationSettings,
})

function OrganizationSettings() {
  const { authKitId } = authRoute.useLoaderData()
  const { slug } = Route.useParams()
  const user = useUser()
  const navigate = useNavigate()

  // Get org data (reactive)
  const { data: org } = useSuspenseQuery(
    convexQuery(api.organizations.getBySlug, { slug }),
  )

  const orgId = org?._id ?? ('' as Id<'organizations'>)

  // Get user's role
  const { data: memberRole } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getMemberRole, {
      organizationId: orgId,
      authKitId,
    }),
  )

  // Get members
  const { data: members } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getByOrganization, {
      organizationId: orgId,
    }),
  )

  // Get pending invites
  const { data: invites } = useSuspenseQuery(
    convexQuery(api.organizationInvites.getByOrganization, {
      organizationId: orgId,
    }),
  )

  if (!org || !memberRole) {
    return null
  }

  const isOwner = memberRole === 'owner'
  const canManage = isOwnerOrAdmin(memberRole)

  if (!canManage) {
    navigate({ to: '/orgs/$slug', params: { slug } })
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        breadcrumbs={[
          { label: 'Betania', to: '/dashboard' },
          { label: org.name, to: '/orgs/$slug', params: { slug } },
          { label: 'Settings' },
        ]}
      />

      <main id="main-content" className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization settings and members
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettings
              org={org}
              authKitId={authKitId}
              isOwner={isOwner}
              slug={slug}
            />
          </TabsContent>

          <TabsContent value="members">
            <MembersSettings
              org={org}
              authKitId={authKitId}
              isOwner={isOwner}
              members={members}
              invites={invites}
              currentUserId={user?._id}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
