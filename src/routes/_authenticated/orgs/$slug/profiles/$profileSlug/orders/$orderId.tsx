import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, getRouteApi, redirect } from '@tanstack/react-router'

import { getAuth } from '@workos/authkit-tanstack-react-start'
import { api } from 'convex/_generated/api'
import { useTranslation } from 'react-i18next'
import type { Id } from 'convex/_generated/dataModel'


import { OrderActions } from '@/components/payment-orders/order-actions'
import { OrderInfoCard } from '@/components/payment-orders/order-info-card'
import { OrderTimeline } from '@/components/payment-orders/order-timeline'
import { RequirementUploadField } from '@/components/payment-orders/requirement-upload-field'
import { StatusBadge } from '@/components/payment-orders/status-badge'
import { PageHeader } from '@/components/shared/page-header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/hooks/use-user'
import { ROUTES } from '@/lib/constants'
import { convexQuery } from '@/lib/convex'

// Statuses where documents can be uploaded
const EDITABLE_STATUSES = ['CREATED', 'NEEDS_SUPPORT']

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

    const authKitId = user.id
    const orderId = params.orderId as Id<'paymentOrders'>

    const [order, profile] = await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.paymentOrders.getById, {
          id: orderId,
          authKitId,
        }),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.paymentOrderProfiles.getBySlug, {
          orgSlug: params.slug,
          profileSlug: params.profileSlug,
        }),
      ),
    ])

    if (!order) {
      throw redirect({
        to: ROUTES.profile,
        params: { slug: params.slug, profileSlug: params.profileSlug },
      })
    }

    // Prefetch all data needed by the component to prevent Suspense blank screen
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.paymentOrderHistory.getByPaymentOrder, {
          paymentOrderId: orderId,
          authKitId,
        }),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.paymentOrderDocuments.getByPaymentOrder, {
          paymentOrderId: orderId,
          authKitId,
        }),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.tags.getById, {
          id: (order.tagId ?? '') as Id<'tags'>,
        }),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.paymentOrderDocuments.checkRequiredUploads, {
          paymentOrderId: orderId,
        }),
      ),
      profile
        ? context.queryClient.ensureQueryData(
            convexQuery(api.organizationMemberships.getMemberRole, {
              organizationId: profile.organization._id,
              authKitId,
            }),
          )
        : Promise.resolve(),
    ])

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

  const { data: documents } = useSuspenseQuery(
    convexQuery(api.paymentOrderDocuments.getByPaymentOrder, {
      paymentOrderId: orderId as Id<'paymentOrders'>,
      authKitId,
    }),
  )

  // Fetch tag if order has one
  const { data: tag } = useSuspenseQuery(
    convexQuery(api.tags.getById, {
      id: (order?.tagId ?? '') as Id<'tags'>,
    }),
  )

  // Check if required uploads are complete
  const { data: uploadsCheck } = useSuspenseQuery(
    convexQuery(api.paymentOrderDocuments.checkRequiredUploads, {
      paymentOrderId: orderId as Id<'paymentOrders'>,
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

  const { t } = useTranslation('orders')

  if (!order || !profile || !currentUser) {
    return null
  }

  const isCreator = order.createdById === currentUser._id
  const isOrgAdminOrOwner = memberRole === 'admin' || memberRole === 'owner'
  const canUploadDocuments =
    (isCreator || isOrgAdminOrOwner) && EDITABLE_STATUSES.includes(order.status)
  const canDeleteDocuments =
    (isCreator || isOrgAdminOrOwner) && EDITABLE_STATUSES.includes(order.status)

  // Get file requirements from tag
  const fileRequirements = tag?.fileRequirements ?? []

  // Map documents by requirement label for easy lookup
  const documentsByLabel = new Map(
    documents.map((doc) => [doc.requirementLabel, doc]),
  )

  // Can submit: all required uploads complete (only applies for CREATED status)
  const canSubmit = order.status !== 'CREATED' || uploadsCheck.complete

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={order.title}
        badge={<StatusBadge status={order.status} />}
        actions={
          <OrderActions
            order={order}
            isCreator={isCreator}
            isOrgAdminOrOwner={isOrgAdminOrOwner}
            authKitId={authKitId}
            canSubmit={canSubmit}
          />
        }
      />

      {/* Two-column layout on desktop, flat grid for mobile reordering */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Info card — always first */}
        <div className="lg:col-span-2">
          <OrderInfoCard order={order} />
        </div>

        {/* Timeline — second on mobile, right column spanning rows on desktop */}
        <div className="lg:sticky lg:top-20 lg:row-span-2 lg:self-start">
          <OrderTimeline history={history} />
        </div>

        {/* Documents — last on mobile, left column on desktop */}
        {fileRequirements.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('documents.title')}</CardTitle>
              <CardDescription>
                {order.status === 'CREATED'
                  ? t('documents.descriptionCreated')
                  : t('documents.descriptionOther')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {fileRequirements.map((requirement) => (
                <RequirementUploadField
                  key={requirement.label}
                  requirement={requirement}
                  document={documentsByLabel.get(requirement.label)}
                  paymentOrderId={orderId as Id<'paymentOrders'>}
                  authKitId={authKitId}
                  canDelete={canDeleteDocuments}
                  disabled={!canUploadDocuments}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
