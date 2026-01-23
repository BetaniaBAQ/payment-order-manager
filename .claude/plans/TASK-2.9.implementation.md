# TASK-2.9: Create Convex function: users.getOrCreate

## Summary

Create mutation to get existing user by `authKitId` or create new user. Updates `updatedAt` on existing users. Handles duplicate email edge case.

## Changes

### New Files

1. **`convex/users.ts`** - Users module with `getOrCreate` mutation

## Implementation Details

```typescript
// convex/users.ts
import { ConvexError, v } from 'convex/values'

import { mutation } from './_generated/server'

export const getOrCreate = mutation({
  args: {
    authKitId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Search by authKitId
    const existing = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    const now = Date.now()

    // 2. If exists, update updatedAt and return
    if (existing) {
      await ctx.db.patch('users', existing._id, { updatedAt: now })
      return { ...existing, updatedAt: now }
    }

    // 3. Check for email conflict (different authKitId, same email)
    const emailConflict = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()

    if (emailConflict) {
      // TODO: Add Sentry logging after TASK-2.9.1
      throw new ConvexError({
        code: 'ACCOUNT_ERROR',
        message: 'Unable to create account. Please contact support.',
      })
    }

    // 4. Create new user
    const userId = await ctx.db.insert('users', {
      authKitId: args.authKitId,
      email: args.email,
      name: args.name,
      createdAt: now,
      updatedAt: now,
    })

    return await ctx.db.get('users', userId)
  },
})
```

## Files

| Action | Path              |
| ------ | ----------------- |
| Create | `convex/users.ts` |

## Consumption

Called from `/api/auth/callback` using WorkOS `onSuccess` callback:

```typescript
// src/routes/api/auth/callback.ts (TASK-2.8 integration)
import { handleCallbackRoute } from '@workos/authkit-tanstack-react-start'
import { api } from 'convex/_generated/api'

import { convexClient } from '@/lib/convex-server'

export const Route = createFileRoute('/api/auth/callback')({
  server: {
    handlers: {
      GET: handleCallbackRoute({
        onSuccess: async ({ user }) => {
          // Sync WorkOS user to Convex
          await convexClient.mutation(api.users.getOrCreate, {
            authKitId: user.id,
            email: user.email,
            name: user.firstName ?? user.email,
          })
        },
      }),
    },
  },
})
```

**Note**: Server-side Convex client setup will be part of TASK-2.8.

## Questions

None - WorkOS AuthKit supports `onSuccess` callback in `handleCallbackRoute`.
