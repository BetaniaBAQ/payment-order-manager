import { useEffect, useRef } from 'react'

import { useSearch } from '@tanstack/react-router'

import {
  subscribeToFilterStore,
  useOrderFiltersActions,
} from '@/stores/orderFiltersStore'

/**
 * Bidirectional sync between URL search params and Zustand filter store.
 *
 * - On mount: URL → Zustand (hydrate from URL)
 * - On Zustand change: Zustand → URL (via history.replaceState to avoid navigation)
 * - On popstate (back/forward): URL → Zustand
 */
export function useSyncProfilePaymentOrderFilters() {
  const search = useSearch({
    from: '/_authenticated/orgs/$slug/profiles/$profileSlug/',
  })
  const { hydrateFromUrl } = useOrderFiltersActions()
  const isHydratingRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 1. On mount: hydrate Zustand from URL
  useEffect(() => {
    isHydratingRef.current = true
    hydrateFromUrl(search)

    // Small delay to prevent immediate URL update after hydration
    const timeout = setTimeout(() => {
      isHydratingRef.current = false
    }, 50)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only on mount, not when search changes

  // 2. Subscribe to Zustand changes → push to URL (without triggering navigation)
  useEffect(() => {
    const unsubscribe = subscribeToFilterStore((state) => {
      // Skip if we're hydrating from URL (avoid circular update)
      if (isHydratingRef.current) return

      // Debounce URL updates
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams()

        // Only add non-empty values
        if (state.search) params.set('q', state.search)
        if (state.status) params.set('status', state.status)
        if (state.tagId) params.set('tag', state.tagId)
        if (state.dateFrom)
          params.set('from', state.dateFrom.getTime().toString())
        if (state.dateTo) params.set('to', state.dateTo.getTime().toString())
        if (state.creatorId) params.set('creator', state.creatorId)

        // Build new URL
        const newSearch = params.toString()
        const newUrl = newSearch
          ? `${window.location.pathname}?${newSearch}`
          : window.location.pathname

        // Update URL without triggering router navigation
        window.history.replaceState(null, '', newUrl)
      }, 300) // 300ms debounce
    })

    return () => {
      unsubscribe()
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // 3. Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      isHydratingRef.current = true
      const params = new URLSearchParams(window.location.search)

      hydrateFromUrl({
        q: params.get('q') ?? undefined,
        status: params.get('status') ?? undefined,
        tag: params.get('tag') ?? undefined,
        from: params.get('from') ? Number(params.get('from')) : undefined,
        to: params.get('to') ? Number(params.get('to')) : undefined,
        creator: params.get('creator') ?? undefined,
      })

      setTimeout(() => {
        isHydratingRef.current = false
      }, 50)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [hydrateFromUrl])
}
