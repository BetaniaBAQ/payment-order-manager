import {
  MutationCache,
  QueryClient,
  notifyManager,
} from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

import { ConvexProvider } from 'convex/react'
import { ConvexQueryClient } from '@convex-dev/react-query'

import { toast } from 'sonner'

import { env } from './lib/env'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  // Optimize React Query notifications in browser
  if (typeof document !== 'undefined') {
    notifyManager.setScheduler(window.requestAnimationFrame)
  }

  // Initialize Convex client
  const convexQueryClient = new ConvexQueryClient(env.VITE_CONVEX_URL)

  // Create QueryClient with Convex integration
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error(error.message)
      },
    }),
  })

  // Connect Convex to QueryClient for reactive updates
  convexQueryClient.connect(queryClient)

  // Create router with Convex provider
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: { queryClient },
    Wrap: ({ children }) => (
      <ConvexProvider client={convexQueryClient.convexClient}>
        {children}
      </ConvexProvider>
    ),
  })

  // Enable SSR query integration
  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

// Type registration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
