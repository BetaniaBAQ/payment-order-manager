import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, getRouteApi, redirect } from '@tanstack/react-router'

import { getAuth } from '@workos/authkit-tanstack-react-start'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

import { OrderActions } from '@/components/payment-orders/order-actions'
import { OrderInfoCard } from '@/components/payment-orders/order-info-card'
import { OrderTimeline } from '@/components/payment-orders/order-timeline'
import { StatusBadge } from '@/components/payment-orders/status-badge'
import { AppHeader } from '@/components/shared/app-header'
import { useUser } from '@/hooks/use-user'
import { HOME_BREADCRUMB, ROUTES } from '@/lib/constants'
import { convexQuery } from '@/lib/convex'

const authRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute(
  '/_authenticated/orgs/$slug/profiles/$profileSlug/orders/$orderId',
)({
  loader: async ({ context, params }) => {
    const { user } = await getAuth()
    if (!user) {
      throw redirect({
        to: ROUTES.profile,
        params: { slug: params.slug, profileSlug: params.profileSlug },
      })
    }

    const order = await context.queryClient.ensureQueryData(
      convexQuery(api.paymentOrders.getById, {
        id: params.orderId as Id<'paymentOrders'>,
        authKitId: user.id,
      }),
    )

    if (!order) {
      throw redirect({
        to: ROUTES.profile,
        params: { slug: params.slug, profileSlug: params.profileSlug },
      })
    }

    return { order }
  },
  component: OrderDetailPage,
})

function OrderDetailPage() {
  const { authKitId } = authRoute.useLoaderData()
  const { slug, profileSlug, orderId } = Route.useParams()
  const currentUser = useUser()

  const { data: order } = useSuspenseQuery(
    convexQuery(api.paymentOrders.getById, {
      id: orderId as Id<'paymentOrders'>,
      authKitId,
    }),
  )

  const { data: history } = useSuspenseQuery(
    convexQuery(api.paymentOrderHistory.getByPaymentOrder, {
      paymentOrderId: orderId as Id<'paymentOrders'>,
      authKitId,
    }),
  )

  const { data: profile } = useSuspenseQuery(
    convexQuery(api.paymentOrderProfiles.getBySlug, {
      orgSlug: slug,
      profileSlug,
    }),
  )

  const orgId = profile?.organization._id ?? ('' as Id<'organizations'>)

  const { data: memberRole } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getMemberRole, {
      organizationId: orgId,
      authKitId,
    }),
  )

  if (!order || !profile) {
    return null
  }

  const isCreator = order.createdById === currentUser._id
  const isOrgAdminOrOwner = memberRole === 'admin' || memberRole === 'owner'

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
          {
            label: profile.name,
            to: ROUTES.profile,
            params: { slug, profileSlug },
          },
          { label: order.title },
        ]}
      />

      <main
        id="main-content"
        className="container mx-auto flex-1 space-y-6 px-4 py-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{order.title}</h1>
            <StatusBadge status={order.status} />
          </div>
          <OrderActions
            order={order}
            isCreator={isCreator}
            isOrgAdminOrOwner={isOrgAdminOrOwner}
            authKitId={authKitId}
          />
        </div>

        {/* Info Card */}
        <OrderInfoCard order={order} />

        {/* Timeline */}
        <OrderTimeline history={history} />
      </main>
    </div>
  )
}
