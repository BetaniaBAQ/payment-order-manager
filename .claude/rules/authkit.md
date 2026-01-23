# WorkOS AuthKit Integration

## Overview

Authentication is handled by WorkOS AuthKit with a hosted login UI. No custom login pages needed.

## Key Files

- `src/start.ts` - AuthKit middleware configuration
- `src/routes/_authenticated.tsx` - Layout guard for protected routes
- `src/routes/logout.tsx` - Logout handler
- `src/routes/api/auth/callback.ts` - OAuth callback handler

## Protecting Routes

Place routes under `src/routes/_authenticated/` folder - they're automatically protected.

```typescript
// src/routes/_authenticated/dashboard.tsx
export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = Route.useLoaderData() // User from parent layout
  return <div>Welcome {user.email}</div>
}
```

## Server Functions

```typescript
import {
  getAuth,
  getSignInUrl,
  signOut,
} from '@workos/authkit-tanstack-react-start'

// Get current user (returns { user } or { user: null })
const { user } = await getAuth()

// Generate sign-in URL with return path
const signInUrl = await getSignInUrl({ data: { returnPathname: '/dashboard' } })

// Sign out and redirect
await signOut({ data: { returnTo: '/' } })
```

## Flow

1. User visits protected route (`/dashboard`)
2. `_authenticated` layout checks auth via `getAuth()`
3. If no user, redirects to WorkOS hosted login
4. After login, WorkOS redirects to `/api/auth/callback`
5. Callback sets session cookie, redirects to original route
