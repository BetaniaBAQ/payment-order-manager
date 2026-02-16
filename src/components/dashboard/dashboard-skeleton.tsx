import { Skeleton } from '@/components/ui/skeleton'

/**
 * Dashboard-specific skeleton matching the org dashboard layout:
 * 4 metric cards + 3 profile card placeholders.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Metric cards row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profiles section */}
      <div className="space-y-5">
        <div className="space-y-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-5">
              <Skeleton className="h-5 w-32" />
              <div className="mt-3 flex items-baseline gap-2">
                <Skeleton className="h-9 w-10" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
