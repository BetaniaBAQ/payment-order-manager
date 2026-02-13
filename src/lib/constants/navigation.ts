import { APP_NAME } from './app'

export const ROUTES = {
  dashboard: '/dashboard',
  newOrg: '/orgs/new',
  org: '/orgs/$slug',
  orgSettings: '/orgs/$slug/settings',
  profile: '/orgs/$slug/profiles/$profileSlug',
  profileSettings: '/orgs/$slug/profiles/$profileSlug/settings',
  order: '/orgs/$slug/profiles/$profileSlug/orders/$orderId',
  adminSubscriptions: '/admin/subscriptions',
} as const

export const HOME_BREADCRUMB = {
  label: APP_NAME,
  to: ROUTES.dashboard,
} as const
