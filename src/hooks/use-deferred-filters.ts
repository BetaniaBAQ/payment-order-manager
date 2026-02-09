import { useCallback, useDeferredValue, useMemo, useTransition } from 'react'

type FilterValue = string | number | boolean | Date | null | undefined

type NormalizedFilters<T> = {
  [K in keyof T]: T[K] extends Date | null | undefined
    ? number | undefined
    : Exclude<T[K], '' | null> | undefined
}

/**
 * Normalizes a value for filter params:
 * - Empty strings → undefined
 * - null → undefined
 * - Dates → timestamp (number)
 * - 0 and false are preserved
 */
function normalizeValue(value: unknown): unknown {
  if (value === '' || value === null) return undefined
  if (value instanceof Date) return value.getTime()
  return value
}

function normalizeFilters<T extends Record<string, FilterValue>>(
  params: T,
): NormalizedFilters<T> {
  const result = {} as NormalizedFilters<T>
  for (const key in params) {
    result[key] = normalizeValue(
      params[key],
    ) as NormalizedFilters<T>[typeof key]
  }
  return result
}

/**
 * Creates a stable cache key from params.
 * Sorted keys ensure consistent ordering.
 */
function createStableKey<T extends Record<string, unknown>>(params: T): string {
  const sortedKeys = Object.keys(params).sort()
  const pairs = sortedKeys.map((key) => `${key}:${params[key] ?? ''}`)
  return pairs.join('|')
}

/**
 * Defers filter params to prevent Suspense re-triggering.
 *
 * Features:
 * - Single source of truth - no separate deps array needed
 * - Auto-normalizes values (empty string/null → undefined, Date → timestamp)
 * - Stable cache keys (sorted keys, no JSON)
 * - useTransition for smooth pending states
 *
 * @example
 * const { deferredParams, isFetching } = useDeferredFilters({
 *   search: debouncedSearch,
 *   status,
 *   tagId,
 *   dateFrom,
 *   dateTo,
 *   creatorId,
 * })
 */
export function useDeferredFilters<T extends Record<string, FilterValue>>(
  params: T,
): {
  deferredParams: NormalizedFilters<T>
  isFetching: boolean
  stableKey: string
  startTransition: (callback: () => void) => void
} {
  const [, startTransition] = useTransition()

  // Normalize params (empty string/null → undefined, Date → timestamp)
  const normalized = useMemo(() => normalizeFilters(params), [params])

  // Create stable key for comparison (sorted keys)
  const currentKey = useMemo(() => createStableKey(normalized), [normalized])

  // Defer the normalized params directly
  const deferredParams = useDeferredValue(normalized)

  // Create stable key for deferred params
  const deferredKey = useMemo(
    () => createStableKey(deferredParams),
    [deferredParams],
  )

  // Detect if we're fetching (current differs from deferred)
  const isFetching = currentKey !== deferredKey

  const stableStartTransition = useCallback(
    (callback: () => void) => startTransition(callback),
    [],
  )

  return {
    deferredParams,
    isFetching,
    stableKey: deferredKey,
    startTransition: stableStartTransition,
  }
}
