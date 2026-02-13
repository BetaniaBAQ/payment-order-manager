import { useSuspenseQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import { convexQuery } from '@convex-dev/react-query'

import { useTranslation } from 'react-i18next'
import type { Id } from 'convex/_generated/dataModel'

import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMutationWithToast } from '@/hooks/use-mutation-with-toast'

const authRoute = getRouteApi('/_authenticated')

const TIER_BADGE_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> =
  {
    free: 'outline',
    pro: 'default',
    enterprise: 'secondary',
  }

const TIER_OPTIONS = ['free', 'pro', 'enterprise'] as const

export const Route = createFileRoute('/_authenticated/admin/subscriptions')({
  component: AdminSubscriptionsPage,
})

function AdminSubscriptionsPage() {
  const { authKitId } = authRoute.useLoaderData()

  const { data: isSuperAdmin } = useSuspenseQuery(
    convexQuery(api.admin.checkIsSuperAdmin, { authKitId }),
  )

  if (!isSuperAdmin) {
    return <AdminRedirect />
  }

  return <AdminSubscriptionsContent authKitId={authKitId} />
}

function AdminRedirect() {
  const navigate = useNavigate()
  navigate({ to: '/dashboard' })
  return null
}

function AdminSubscriptionsContent({ authKitId }: { authKitId: string }) {
  const { t } = useTranslation('billing')

  const { data: organizations } = useSuspenseQuery(
    convexQuery(api.admin.listOrganizationsWithSubscriptions, { authKitId }),
  )

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
        <p className="text-muted-foreground text-sm">
          {t('admin.description')}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('admin.organizationColumn')}</TableHead>
            <TableHead>{t('admin.slugColumn')}</TableHead>
            <TableHead>{t('admin.currentPlanColumn')}</TableHead>
            <TableHead>{t('admin.changePlanColumn')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <OrgRow key={org._id} org={org} authKitId={authKitId} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function OrgRow({
  org,
  authKitId,
}: {
  org: {
    _id: Id<'organizations'>
    name: string
    slug: string
    tier: string
    status: string
    paymentProvider: string
  }
  authKitId: string
}) {
  const { t } = useTranslation('billing')

  const assignTier = useMutationWithToast(api.admin.assignTier, {
    successMessage: t('admin.tierUpdated'),
    errorMessage: t('admin.tierUpdatedError'),
  })

  const handleTierChange = (tier: string) => {
    assignTier.mutate({
      authKitId,
      organizationId: org._id,
      tier: tier as 'free' | 'pro' | 'enterprise',
    })
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{org.name}</TableCell>
      <TableCell className="text-muted-foreground">{org.slug}</TableCell>
      <TableCell>
        <Badge variant={TIER_BADGE_VARIANTS[org.tier] ?? 'outline'}>
          {t(`tiers.${org.tier}`)}
        </Badge>
      </TableCell>
      <TableCell>
        <Select value={org.tier} onValueChange={handleTierChange}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIER_OPTIONS.map((tier) => (
              <SelectItem key={tier} value={tier}>
                {t(`tiers.${tier}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  )
}
