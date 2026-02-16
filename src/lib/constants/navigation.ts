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
