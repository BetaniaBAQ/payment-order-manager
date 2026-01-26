---
paths:
  - 'convex/**/*.ts'
  - 'src/**/*.ts'
  - 'src/**/*.tsx'
---

# Convex

## Function Types

- `query` - Read-only, cached, reactive (auto-updates when data changes)
- `mutation` - Write operations, runs in transaction, can't call external APIs
- `action` - Can call external APIs (email, payments), not transactional

Use `action` when you need to call external services (e.g., Resend for emails).

## Server-Side Rules

- Always validate args with `v.` validators: `args: { id: v.id("users") }`
- Use `ctx.db.query("table").withIndex("by_field", q => q.eq("field", value))` for indexed lookups
- Prefer `ctx.db.get(id)` over query when you have the document ID
- Use `internal.` prefix for functions only called by other Convex functions
- Throw `ConvexError` for expected failures with structured error data
- Add `.index("by_field", ["field"])` to schema for frequently filtered fields

## Client-Side Rules

- Never manually invalidate queries - Convex reactivity handles updates automatically
- Use `FunctionReturnType` from `convex/server` for typing Convex function returns:

```tsx
import type { FunctionReturnType } from 'convex/server'

type Profile = NonNullable<FunctionReturnType<typeof api.profiles.getBySlug>>
```

Don't use `ReturnType<typeof api.xxx>` - it doesn't work with Convex's `FunctionReference` type.

## Mutations with Toast Feedback

Use `useMutationWithToast` for mutations, `useActionWithToast` for actions:

```tsx
import {
  useActionWithToast,
  useMutationWithToast,
} from '@/hooks/use-mutation-with-toast'

// For mutations (database writes)
const deleteMutation = useMutationWithToast(api.tags.delete_, {
  successMessage: 'Tag deleted',
  errorMessage: 'Failed to delete tag',
  onSuccess: () => setOpen(false),
})

// For actions (external API calls)
const inviteAction = useActionWithToast(api.invites.create, {
  successMessage: 'Invite sent!',
  onSuccess: () => setOpen(false),
})
```
