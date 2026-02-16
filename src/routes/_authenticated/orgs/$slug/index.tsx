import { useMemo, useState } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  getRouteApi,
  redirect,
} from '@tanstack/react-router'

import { getAuth } from '@workos/authkit-tanstack-react-start'
import { api } from 'convex/_generated/api'

import {
  CalendarBlank,
  Crown,
  Folder,
  MagnifyingGlass,
  Receipt,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import type { Id } from 'convex/_generated/dataModel'

import { MetricCard } from '@/components/dashboard/metric-card'
import { CreateProfileDialog } from '@/components/profile-settings/create-profile-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useUser } from '@/hooks/use-user'
import { isOwnerOrAdmin } from '@/lib/auth'
import { ROUTES } from '@/lib/constants'
import { convexQuery } from '@/lib/convex'

const PROFILE_ACCENT_COLORS = [
  'border-l-chart-1',
  'border-l-chart-2',
  'border-l-chart-3',
  'border-l-chart-4',
  'border-l-chart-5',
]

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
      context.queryClient.ensureQueryData(
        convexQuery(api.subscriptions.getByOrganization, {
          organizationId: org._id,
        }),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.paymentOrders.getTotalCountByOrganization, {
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
  const currentUser = useUser()
  const { t } = useTranslation('settings')
  const { t: tc } = useTranslation('common')
  const { t: tb } = useTranslation('billing')
  const [search, setSearch] = useState('')

  const { data: org } = useSuspenseQuery(
    convexQuery(api.organizations.getBySlug, { slug }),
  )

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

  const { data: subscriptionData } = useSuspenseQuery(
    convexQuery(api.subscriptions.getByOrganization, {
      organizationId: orgId,
    }),
  )

  const { data: totalOrders } = useSuspenseQuery(
    convexQuery(api.paymentOrders.getTotalCountByOrganization, {
      organizationId: orgId,
    }),
  )

  const isOrgAdminOrOwner = isOwnerOrAdmin(memberRole)

  const filteredProfiles = useMemo(() => {
    if (!search.trim()) return profiles
    const q = search.toLowerCase()
    return profiles.filter((p) => p.name.toLowerCase().includes(q))
  }, [profiles, search])

  if (!org) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl tracking-tight">{org.name}</h1>
          {memberRole && (
            <Badge variant="secondary">{tc(`roles.${memberRole}`)}</Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-1">
          {t('orgDashboard.description')}
        </p>
      </div>

      {/* Metrics row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Folder}
          label={t('orgDashboard.metrics.totalProfiles')}
          value={profiles.length}
        />
        <MetricCard
          icon={Receipt}
          label={t('orgDashboard.metrics.totalOrders')}
          value={totalOrders}
        />
        <MetricCard
          icon={Crown}
          label={t('orgDashboard.metrics.planTier')}
          value={tb(`tiers.${subscriptionData.tier}`)}
        />
        <MetricCard
          icon={CalendarBlank}
          label={t('orgDashboard.metrics.monthlyOrders')}
          value={subscriptionData.usage.orders}
        />
      </div>

      {/* Profiles section */}
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              {t('orgDashboard.profiles')}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t('orgDashboard.profilesDescription')}
            </p>
          </div>
          {isOrgAdminOrOwner && (
            <CreateProfileDialog
              organizationId={orgId}
              authKitId={authKitId}
              orgSlug={slug}
            />
          )}
        </div>

        {profiles.length >= 5 && (
          <div className="relative">
            <MagnifyingGlass
              className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              placeholder={t('orgDashboard.searchProfiles')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label={t('orgDashboard.searchProfiles')}
            />
          </div>
        )}

        {profiles.length === 0 ? (
          <EmptyState
            icon={Folder}
            title={tc('empty.profiles.title')}
            description={tc('empty.profiles.description')}
            action={
              isOrgAdminOrOwner ? (
                <CreateProfileDialog
                  organizationId={orgId}
                  authKitId={authKitId}
                  orgSlug={slug}
                />
              ) : undefined
            }
          />
        ) : filteredProfiles.length === 0 ? (
          <EmptyState
            icon={MagnifyingGlass}
            title={tc('empty.noResults.title')}
            description={tc('empty.noResults.description')}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile, index) => (
              <ProfileCard
                key={profile._id}
                profile={profile}
                slug={slug}
                accentColor={
                  PROFILE_ACCENT_COLORS[index % PROFILE_ACCENT_COLORS.length]
                }
                canManage={
                  currentUser?._id === profile.ownerId || isOrgAdminOrOwner
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Profile Card
// ---------------------------------------------------------------------------

type ProfileCardProps = {
  profile: {
    _id: string
    name: string
    slug: string
    paymentOrderCount: number
    ownerId: string
  }
  slug: string
  accentColor: string
  canManage: boolean
}

function ProfileCard({ profile, slug, accentColor }: ProfileCardProps) {
  const { t } = useTranslation('settings')

  return (
    <Link
      to={ROUTES.profile}
      params={{ slug, profileSlug: profile.slug }}
      className={`bg-card group block rounded-xl border border-l-4 ${accentColor} hover:border-primary/40 animate-in fade-in p-5 transition-all duration-200 hover:shadow-sm`}
    >
      <p className="group-hover:text-primary truncate font-medium transition-colors">
        {profile.name}
      </p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-serif text-3xl tabular-nums">
          {profile.paymentOrderCount}
        </span>
        <span className="text-muted-foreground text-sm">
          {t('orgDashboard.orderLabel', {
            count: profile.paymentOrderCount,
          })}
        </span>
      </div>
    </Link>
  )
}
