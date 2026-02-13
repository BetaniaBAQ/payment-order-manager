import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, getRouteApi, redirect } from '@tanstack/react-router'

import { getAuth } from '@workos/authkit-tanstack-react-start'
import { api } from 'convex/_generated/api'
import { useTranslation } from 'react-i18next'
import type { Id } from 'convex/_generated/dataModel'


import { SettingsButton } from '@/components/dashboard/settings-button'
import { CreateProfileDialog } from '@/components/profile-settings/create-profile-dialog'
import { AppHeader } from '@/components/shared/app-header'
import { EmptyState } from '@/components/shared/empty-state'
import { List } from '@/components/shared/list'
import { ListItemLink } from '@/components/shared/list-item-link'
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
        convexQuery(api.paymentOrderProfiles.getByOrganization, {
          organizationId: org._id,
        }),
      ),
    ])

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

  const { t } = useTranslation('settings')
  const { t: tc } = useTranslation('common')

  if (!org) {
    return null
  }

  const isOrgAdminOrOwner = isOwnerOrAdmin(memberRole)

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        breadcrumbs={[
          HOME_BREADCRUMB,
          { type: 'org-chooser' as const, currentSlug: slug },
        ]}
      >
        {memberRole && (
          <Badge variant="secondary">{tc(`roles.${memberRole}`)}</Badge>
        )}
      </AppHeader>

      <main id="main-content" className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          {isOrgAdminOrOwner && <SettingsButton slug={slug} size="large" />}
          <div>
            <h1 className="text-2xl font-bold">{org.name}</h1>
            <p className="text-muted-foreground">
              {t('orgDashboard.description')}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('orgDashboard.profiles')}</CardTitle>
              <CardDescription>
                {t('orgDashboard.profilesDescription')}
              </CardDescription>
            </div>
            {isOrgAdminOrOwner && (
              <CreateProfileDialog
                organizationId={orgId}
                authKitId={authKitId}
                orgSlug={slug}
              />
            )}
          </CardHeader>
          <CardContent>
            <List
              items={profiles}
              keyExtractor={(profile) => profile._id}
              searchExtractor={(profile) => profile.name}
              searchPlaceholder={t('orgDashboard.searchProfiles')}
              renderItem={(profile) => (
                <ListItemLink
                  to={ROUTES.profile}
                  params={{ slug, profileSlug: profile.slug }}
                >
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {t('dashboard.orderCount', {
                        count: profile.paymentOrderCount,
                      })}
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
              emptyState={<EmptyState title={tc('empty.profiles.title')} />}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
