import { createRouter } from '@tanstack/react-router'
import { QueryClient, MutationCache, notifyManager } from '@tanstack/react-query'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { ConvexProvider } from 'convex/react'
import { toast } from 'sonner'

import { routeTree } from './routeTree.gen'

export function getRouter() {
  // Optimize React Query notifications in browser
  if (typeof document !== 'undefined') {
    notifyManager.setScheduler(window.requestAnimationFrame)
  }

  // Initialize Convex client
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL
  if (!CONVEX_URL) {
    throw new Error('Missing VITE_CONVEX_URL environment variable')
  }
  const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

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
