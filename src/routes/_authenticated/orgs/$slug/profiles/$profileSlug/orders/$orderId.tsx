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
import { AppHeader } from '@/components/shared/app-header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/hooks/use-user'
import { HOME_BREADCRUMB, ROUTES } from '@/lib/constants'
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
    <div className="flex min-h-screen flex-col">
      <AppHeader
        breadcrumbs={[
          HOME_BREADCRUMB,
          { type: 'org-chooser' as const, currentSlug: slug },
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
            canSubmit={canSubmit}
          />
        </div>

        {/* Info Card */}
        <OrderInfoCard order={order} />

        {/* Documents */}
        {fileRequirements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('documents.title')}</CardTitle>
              <CardDescription>
                {order.status === 'CREATED'
                  ? t('documents.descriptionCreated')
                  : t('documents.descriptionOther')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

        {/* Timeline */}
        <OrderTimeline history={history} />
      </main>
    </div>
  )
}
