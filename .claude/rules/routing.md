---
paths:
  - 'src/routes/**/*.tsx'
  - 'src/routes/**/*.ts'
  - 'src/router.tsx'
  - 'src/hooks/use-deferred-filters.ts'
---

# TanStack Router

- Routes are file-based in `src/routes/`
- Use `createFileRoute` for route definitions
- Leverage loader functions for data fetching
- Use type-safe `Link` component for navigation
- Route params are typed automatically from the filename

## Navigation with Progress Bar

GitHub-style navigation with progress bar at top of viewport.

**Progress bar**: `RouteProgressBar` in `src/components/shared/route-progress-bar.tsx`

Shows while loaders run. Proper prefetching ensures no blank screens.

## Preventing Blank Screens with useSuspenseQuery

**Critical:** ALL `useSuspenseQuery` calls in a component must be prefetched in the route loader. Otherwise, the component suspends → blank screen.

### Bad - Unprefetched queries cause blank screen

```typescript
loader: async ({ context, params }) => {
  // Only prefetches profile
  const profile = await context.queryClient.ensureQueryData(
    convexQuery(api.profiles.getBySlug, { slug: params.slug }),
  )
  return { profile }
}

function ProfilePage() {
  const { data: profile } = useSuspenseQuery(...)  // ✓ prefetched
  const { data: members } = useSuspenseQuery(...)  // ✗ NOT prefetched → BLANK
  const { data: tags } = useSuspenseQuery(...)     // ✗ NOT prefetched → BLANK
}
```

### Good - All queries prefetched

```typescript
loader: async ({ context, params }) => {
  const { user } = await getAuth()
  const authKitId = user?.id ?? ''

  const profile = await context.queryClient.ensureQueryData(
    convexQuery(api.profiles.getBySlug, { slug: params.slug }),
  )

  if (!profile) throw redirect({ to: ROUTES.dashboard })

  // Prefetch ALL data the component needs
  await Promise.all([
    context.queryClient.ensureQueryData(
      convexQuery(api.members.getByOrg, { orgId: profile.orgId }),
    ),
    context.queryClient.ensureQueryData(
      convexQuery(api.tags.getByProfile, { profileId: profile._id }),
    ),
  ])

  return { profile }
}
```

## Checklist for New Routes

1. List all `useSuspenseQuery` calls in component
2. Prefetch each with `ensureQueryData` in loader
3. Use `Promise.all` for parallel prefetching
4. Get `authKitId` via `getAuth()` in loader (not parent loader data)

## useSuspenseQuery vs useQuery

| Use Case                 | Hook               | Prefetch Required? |
| ------------------------ | ------------------ | ------------------ |
| Critical page data       | `useSuspenseQuery` | Yes                |
| Optional/secondary data  | `useQuery`         | No                 |
| Frequently changing data | `useQuery`         | No                 |

## useDeferredFilters Hook

Use `useDeferredFilters` to prevent Suspense re-triggering when filter params change within a page.

**Location**: `src/hooks/use-deferred-filters.ts`

### Features

- **Auto-normalization**: Empty string/null → `undefined`, Date → timestamp
- **Single source of truth**: No deps array needed
- **No JSON overhead**: Uses stable key comparison, not JSON.parse
- **Smooth transitions**: `useDeferredValue` for deferred updates
- **Type-safe**: Output type reflects normalized values

### Usage

```typescript
const { deferredParams, isFetching } = useDeferredFilters({
  search: debouncedSearch,
  status,
  tagId,
  dateFrom,  // Date automatically converted to timestamp
  dateTo,
  creatorId,
})

// Use deferredParams in query - won't re-trigger Suspense on filter changes
const { data } = useSuspenseQuery(
  convexQuery(api.orders.getByProfile, {
    profileId,
    ...deferredParams,
  }),
)

// Show loading indicator while fetching
{isFetching && <Spinner />}
```

### Normalization Rules

| Input       | Output      |
| ----------- | ----------- |
| `""`        | `undefined` |
| `null`      | `undefined` |
| `undefined` | `undefined` |
| `0`         | `0`         |
| `false`     | `false`     |
| `Date`      | `number`    |

### How It Works

1. **Initial load**: `useSuspenseQuery` suspends, loader prefetching shows data
2. **Filter change**: `deferredParams` stays same initially → query key unchanged → no Suspense
3. **Data arrives**: `deferredParams` updates → new data renders smoothly
4. **isFetching**: `true` while deferred params catching up to current params

# API Routes (Server Handlers)

API routes use `createFileRoute` with `server.handlers` - NOT Nitro/h3 directly.

- Place API routes in `src/routes/api/` as `.ts` files
- Use `server.handlers` object with HTTP method keys (GET, POST, etc.)
- Handlers receive `{ request }` and return `Response` objects
- Path alias `@/` works normally in API routes

```typescript
// src/routes/api/example.ts
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/example')({
  server: {
    handlers: {
      GET: ({ request }) => {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
      POST: async ({ request }) => {
        const body = await request.json()
        return new Response(JSON.stringify({ received: body }))
      },
    },
  },
})
```
