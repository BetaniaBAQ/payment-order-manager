import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/orgs/$slug/profiles/$profileSlug/_profile-settings/settings',
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/orgs/$slug/profiles/$profileSlug/details',
      params: { slug: params.slug, profileSlug: params.profileSlug },
    })
  },
})
