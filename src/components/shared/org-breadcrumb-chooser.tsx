import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { Link, getRouteApi } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'

import { CaretDown, Check, Plus } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/lib/constants'
import { convexQuery, useConvexMutation } from '@/lib/convex'

const authRoute = getRouteApi('/_authenticated')

type OrgBreadcrumbChooserProps = {
  currentOrgSlug: string
}

export function OrgBreadcrumbChooser({
  currentOrgSlug,
}: OrgBreadcrumbChooserProps) {
  const { authKitId } = authRoute.useLoaderData()
  const { t } = useTranslation('common')

  const { data: organizations } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getByUser, { authKitId }),
  )

  const currentOrg = organizations.find((org) => org.slug === currentOrgSlug)

  const convexUpdateLastSelectedOrg = useConvexMutation(
    api.users.updateLastSelectedOrg,
  )
  const updateLastSelectedOrg = useMutation({
    mutationFn: (args: Parameters<typeof convexUpdateLastSelectedOrg>[0]) =>
      convexUpdateLastSelectedOrg(args),
  })

  const handleOrgSelect = (organizationId: string) => {
    updateLastSelectedOrg.mutate({
      authKitId,
      organizationId: organizationId as Parameters<
        typeof convexUpdateLastSelectedOrg
      >[0]['organizationId'],
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:ring-ring flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-sm font-medium outline-none hover:underline focus:ring-2">
        <span>{currentOrg?.name ?? currentOrgSlug}</span>
        <CaretDown className="text-muted-foreground size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem
          render={(props) => <Link {...props} to={ROUTES.newOrg} />}
        >
          <Plus />
          <span>{t('breadcrumbs.createOrganization')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {t('breadcrumbs.organizations')}
          </DropdownMenuLabel>
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org._id}
              render={(props) => (
                <Link
                  {...props}
                  to={ROUTES.org}
                  params={{ slug: org.slug }}
                  onClick={() => handleOrgSelect(org._id)}
                />
              )}
            >
              <span>{org.name}</span>
              {org.slug === currentOrgSlug && <Check className="ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
