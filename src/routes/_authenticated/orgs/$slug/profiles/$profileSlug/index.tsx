import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, getRouteApi, redirect } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

import { SettingsButton } from '@/components/dashboard/settings-button'
import { CreateOrderDialog } from '@/components/payment-orders/create-order-dialog'
import { OrderFilters } from '@/components/payment-orders/order-filters'
import { OrderList } from '@/components/payment-orders/order-list'
import { AppHeader } from '@/components/shared/app-header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useDebounce } from '@/hooks/use-debounce'
import { useUser } from '@/hooks/use-user'
import { isOwnerOrAdmin } from '@/lib/auth'
import { HOME_BREADCRUMB, ROUTES } from '@/lib/constants'
import { convexQuery } from '@/lib/convex'
import {
  useOrderFilterCreatorId,
  useOrderFilterDateFrom,
  useOrderFilterDateTo,
  useOrderFilterSearch,
  useOrderFilterStatus,
  useOrderFilterTagId,
} from '@/stores/orderFiltersStore'

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
      throw redirect({ to: ROUTES.org, params: { slug: params.slug } })
    }

    return { profile }
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { authKitId } = authRoute.useLoaderData()
  const { slug, profileSlug } = Route.useParams()

  // Filter state from Zustand store (for query params)
  const search = useOrderFilterSearch()
  const status = useOrderFilterStatus()
  const tagId = useOrderFilterTagId()
  const dateFrom = useOrderFilterDateFrom()
  const dateTo = useOrderFilterDateTo()
  const creatorId = useOrderFilterCreatorId()

  // Debounce search input
  const debouncedSearch = useDebounce(search, 300)

  const { data: profile } = useSuspenseQuery(
    convexQuery(api.paymentOrderProfiles.getBySlug, {
      orgSlug: slug,
      profileSlug,
    }),
  )

  const currentUser = useUser()

  const orgId = profile?.organization._id ?? ('' as Id<'organizations'>)
  const profileId = profile?._id ?? ('' as Id<'paymentOrderProfiles'>)

  const { data: memberRole } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getMemberRole, {
      organizationId: orgId,
      authKitId,
    }),
  )

  const { data: orders } = useSuspenseQuery(
    convexQuery(api.paymentOrders.getByProfile, {
      profileId,
      authKitId,
      search: debouncedSearch || undefined,
      status: status ? [status] : undefined,
      tagId,
      dateFrom: dateFrom ? dateFrom.getTime() : undefined,
      dateTo: dateTo ? dateTo.getTime() : undefined,
      creatorId,
    }),
  )

  const { data: tags } = useSuspenseQuery(
    convexQuery(api.tags.getByProfile, {
      profileId,
    }),
  )

  const { data: creators } = useSuspenseQuery(
    convexQuery(api.paymentOrders.getCreators, {
      profileId,
      authKitId,
    }),
  )

  if (!profile) {
    return null
  }

  const isProfileOwner = currentUser?._id === profile.owner?._id
  const canManageProfile = isProfileOwner || isOwnerOrAdmin(memberRole)
  const showCreatorFilter = isProfileOwner || isOwnerOrAdmin(memberRole)

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
          { label: profile.name },
        ]}
      />

      <main id="main-content" className="container mx-auto flex-1 px-4 py-8">
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Payment Orders</CardTitle>
              <CardDescription>
                Payment orders submitted to this profile
              </CardDescription>
            </div>
            <CreateOrderDialog
              profileId={profileId}
              authKitId={authKitId}
              orgSlug={slug}
              profileSlug={profileSlug}
              tags={tags}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <OrderFilters
              tags={tags}
              creators={creators}
              showCreatorFilter={showCreatorFilter}
            />
            <OrderList orders={orders} slug={slug} profileSlug={profileSlug} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
