import { ConvexHttpClient } from 'convex/browser'

import { env } from './env'

export const convexClient = new ConvexHttpClient(env.VITE_CONVEX_URL)
