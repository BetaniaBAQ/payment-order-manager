import { getRouteApi } from '@tanstack/react-router'

const authRoute = getRouteApi('/_authenticated')

export function useUser() {
  const { user } = authRoute.useLoaderData()
  return user
}
