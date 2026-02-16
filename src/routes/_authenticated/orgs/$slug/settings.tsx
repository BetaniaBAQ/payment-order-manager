import { useSuspenseQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  getRouteApi,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { getAuth } from '@workos/authkit-tanstack-react-start'
import { api } from 'convex/_generated/api'
import { useTranslation } from 'react-i18next'
import type { Id } from 'convex/_generated/dataModel'


import { BillingSettings } from '@/components/billing/billing-settings'
import {
  GeneralSettings,
  MembersSettings,
  SETTINGS_TABS,
} from '@/components/organization-settings'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/hooks/use-user'
import { isOwnerOrAdmin } from '@/lib/auth'
import { ROUTES } from '@/lib/constants'
import { convexQuery } from '@/lib/convex'

const authRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute('/_authenticated/orgs/$slug/settings')({
  loader: async ({ context, params }) => {
    const { user } = await getAuth()
    const authKitId = user?.id ?? ''

    const org = await context.queryClient.ensureQueryData(
      convexQuery(api.organizations.getBySlug, { slug: params.slug }),
    )

    if (!org) {
      throw redirect({ to: ROUTES.dashboard })
    }

    // Prefetch all data needed by the component to prevent Suspense blank screen
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.organizationMemberships.getMemberRole, {
          organizationId: org._id,
          authKitId,
        }),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.organizationMemberships.getByOrganization, {
          organizationId: org._id,
        }),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.organizationInvitesInternal.getByOrganization, {
          organizationId: org._id,
        }),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.subscriptions.getByOrganization, {
          organizationId: org._id,
        }),
      ),
    ])

    return { org }
  },
  component: OrganizationSettings,
})

function OrganizationSettings() {
  const { authKitId } = authRoute.useLoaderData()
  const { slug } = Route.useParams()
  const user = useUser()
  const navigate = useNavigate()
  const { t } = useTranslation('settings')

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
    convexQuery(api.organizationInvitesInternal.getByOrganization, {
      organizationId: orgId,
    }),
  )

  if (!org || !memberRole) {
    return null
  }

  const isOwner = memberRole === 'owner'
  const canManage = isOwnerOrAdmin(memberRole)

  if (!canManage) {
    navigate({ to: ROUTES.org, params: { slug } })
    return null
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('orgSettings.title')}
        description={t('orgSettings.description')}
      />

      <Tabs defaultValue={SETTINGS_TABS.GENERAL} className="space-y-6">
        <TabsList>
          <TabsTrigger value={SETTINGS_TABS.GENERAL}>
            {t('tabs.general')}
          </TabsTrigger>
          <TabsTrigger value={SETTINGS_TABS.MEMBERS}>
            {t('tabs.members')}
          </TabsTrigger>
          <TabsTrigger value={SETTINGS_TABS.BILLING}>
            {t('tabs.billing')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={SETTINGS_TABS.GENERAL}>
          <GeneralSettings
            org={org}
            authKitId={authKitId}
            isOwner={isOwner}
            slug={slug}
          />
        </TabsContent>

        <TabsContent value={SETTINGS_TABS.MEMBERS}>
          <MembersSettings
            org={org}
            authKitId={authKitId}
            isOwner={isOwner}
            members={members}
            invites={invites}
            currentUserId={user?._id}
          />
        </TabsContent>

        <TabsContent value={SETTINGS_TABS.BILLING}>
          <BillingSettings organizationId={orgId} country="CO" slug={slug} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
