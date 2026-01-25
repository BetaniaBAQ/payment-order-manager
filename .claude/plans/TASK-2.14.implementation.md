# TASK-2.14: Create useAuth hook

## Summary

Create wrapper hook combining WorkOS AuthKit auth state with Convex user data.

## Questions (for user)

- WorkOS AuthKit already provides `useAuth` from `@workos/authkit-tanstack-react-start/client`. Should this hook wrap it or be a separate implementation?
- The existing `useUser` hook already fetches Convex user data. Should `useAuth` replace or extend it?

## Changes

### `src/hooks/use-auth.ts`

Create hook that combines:

- WorkOS AuthKit auth state (session, signOut)
- Convex user data (via `getCurrentUser` query)

```typescript
import { useQuery } from '@tanstack/react-query'

import { useAuth as useWorkOSAuth } from '@workos/authkit-tanstack-react-start/client'
import { api } from 'convex/_generated/api'
import { convexQuery } from '@convex-dev/react-query'

export function useAuth() {
  const workosAuth = useWorkOSAuth()
  const { user: workosUser, signOut } = workosAuth

  const { data: user, isLoading } = useQuery({
    ...convexQuery(api.users.getCurrentUser, {
      authKitId: workosUser?.id ?? '',
    }),
    enabled: !!workosUser?.id,
  })

  return {
    user: user ?? null,
    isLoading: isLoading || workosAuth.loading,
    isAuthenticated: !!user,
    login: () => {
      /* redirect to WorkOS hosted login */
    },
    logout: signOut,
    refresh: workosAuth.refreshAuth,
  }
}
```

## Files

| File                    | Action                    |
| ----------------------- | ------------------------- |
| `src/hooks/use-auth.ts` | Create - new useAuth hook |
