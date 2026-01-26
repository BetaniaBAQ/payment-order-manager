import { Skeleton } from '@/components/ui/skeleton'

/**
 * Full page skeleton for route loading states.
 * Mimics the typical page layout with header and content area.
 */
export function PageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header skeleton */}
      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-4" />
          <Skeleton className="h-5 w-24" />
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="rounded-lg border p-6">
          <div className="mb-4 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </main>
    </div>
  )
}

/**
 * Card skeleton for loading states within cards.
 */
export function CardSkeleton() {
  return (
    <div className="rounded-lg border p-6">
      <div className="mb-4 space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

/**
 * List skeleton for loading states in list components.
 */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  )
}
