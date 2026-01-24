import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import { convexQuery } from '@convex-dev/react-query'

const authRoute = getRouteApi('/_authenticated')

export function useUser() {
  const { authKitId } = authRoute.useLoaderData()
  const { data: user } = useSuspenseQuery(
    convexQuery(api.users.getByAuthKitId, { authKitId }),
  )
  return user
}
