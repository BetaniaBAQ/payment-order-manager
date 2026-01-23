# WorkOS AuthKit Integration

## Overview

Authentication is handled by WorkOS AuthKit with a hosted login UI. No custom login pages needed.

## Key Files

- `src/start.ts` - AuthKit middleware configuration
- `src/routes/_authenticated.tsx` - Layout guard for protected routes
- `src/routes/logout.tsx` - Logout handler
- `src/routes/api/auth/callback.ts` - OAuth callback handler
- `src/hooks/use-user.ts` - `useUser()` hook for accessing authenticated user

## How Authentication Works

### Middleware Layer

`authkitMiddleware()` runs on every request:

1. Reads session cookie containing JWT tokens (access + refresh)
2. Validates JWT signature **locally** (no WorkOS API call)
3. If access token expired, uses refresh token to get new one (WorkOS API call, infrequent)
4. Stores validated auth in request context

### Why No Rate Limiting Concerns

- JWT validation happens locally on your server
- WorkOS API only called during token refresh (every 5-60 min) and login/logout
- `getAuth()` reads from middleware context, not WorkOS API

## Server Functions vs Client Hooks

### Server Functions (use in loaders/server functions)

```typescript
import {
  getAuth,
  getSignInUrl,
  signOut,
  switchToOrganization,
} from '@workos/authkit-tanstack-react-start'
```

### Client Hooks (use in components)

```typescript
import {
  AuthKitProvider,
  useAuth,
  useAccessToken,
} from '@workos/authkit-tanstack-react-start/client'
```

## Why Use `loader` Not `beforeLoad` for Auth

In TanStack Start:

| Function     | Where it runs                       | Type                 |
| ------------ | ----------------------------------- | -------------------- |
| `loader`     | Always on server                    | Server function      |
| `beforeLoad` | Server on SSR, client on navigation | Route lifecycle hook |

`getAuth()` is a server function. WorkOS recommends calling it in `loader` because:

- Loaders always run on server where middleware context is available
- `beforeLoad` runs on client during navigation, triggering RPC calls
- Consistent execution model, predictable behavior

**Note:** `beforeLoad` returns merge into router context (available to child loaders), but `loader` returns do not. This is a TanStack Router design trade-off.

## Protecting Routes

Place routes under `src/routes/_authenticated/` folder - they're automatically protected.

### Accessing User in Components (Recommended)

Use the `useUser()` hook from `@/hooks/use-user`:

```typescript
// src/routes/_authenticated/dashboard.tsx
import { useUser } from '@/lib/auth'

function DashboardPage() {
  const user = useUser() // Type: User (non-null, guaranteed by parent loader)
  return <div>Welcome {user.email}</div>
}
```

The hook reads from the parent layout's loader data. Since the `_authenticated` loader redirects unauthenticated users, the returned user is guaranteed to be non-null.

### When to Use `AuthKitProvider` + `useAuth()` Instead

Use the WorkOS client hooks when you need:

- `signOut()`, `refreshAuth()` methods
- Real-time session expiry detection (`onSessionExpired` callback)
- Access to `permissions`, `roles`, `organizationId`, `sessionId`

Setup in authenticated layout:

```typescript
// src/routes/_authenticated.tsx
import { AuthKitProvider } from '@workos/authkit-tanstack-react-start/client'

function AuthenticatedLayout() {
  const auth = Route.useLoaderData()

  return (
    <AuthKitProvider initialAuth={auth}>
      <Outlet />
    </AuthKitProvider>
  )
}
```

Then use in components:

```typescript
import { useAuth } from '@workos/authkit-tanstack-react-start/client'

function UserMenu() {
  const { user, signOut, permissions } = useAuth()
  // user may be null, requires null checks
}
```

### `useAuth()` vs `useUser()` Comparison

| Aspect         | `useUser()`       | `useAuth()`                  |
| -------------- | ----------------- | ---------------------------- |
| Returns        | `User` (non-null) | `User \| null`               |
| Null checks    | Not needed        | Required                     |
| Provider setup | None              | Requires `AuthKitProvider`   |
| Extra methods  | None              | `signOut()`, `refreshAuth()` |
| RBAC data      | Not available     | `permissions`, `roles`, etc. |
| Session expiry | Not handled       | `onSessionExpired` callback  |

## Auth Flow

1. User visits protected route (`/dashboard`)
2. `_authenticated` layout loader checks auth via `getAuth()`
3. If no user, redirects to WorkOS hosted login
4. After login, WorkOS redirects to `/api/auth/callback`
5. Callback sets session cookie, redirects to original route

## Common Patterns

### Get auth in a server function

```typescript
import { createServerFn } from '@tanstack/react-start'
import { getAuth } from '@workos/authkit-tanstack-react-start'

const getProtectedData = createServerFn('GET', async () => {
  const { user } = await getAuth()
  if (!user) throw new Error('Unauthorized')
  // ... fetch user-specific data
})
```

### Check permissions in component

```typescript
import { useAuth } from '@workos/authkit-tanstack-react-start/client'

function AdminPanel() {
  const { permissions } = useAuth()

  if (!permissions?.includes('admin:read')) {
    return <div>Access denied</div>
  }

  return <div>Admin content</div>
}
```
