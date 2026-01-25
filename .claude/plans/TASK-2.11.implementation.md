# TASK-2.11: Create Convex function: users.getByEmail

## Summary

Add query to fetch user by email using index, respecting soft delete.

## Questions (for user)

None - follows same pattern as getById.

## Changes

### `convex/users.ts`

Add `getByEmail` query:

- Arg: `email: v.string()`
- Use `by_email` index for efficient lookup
- Return `null` if not found OR if `deletedAt` is set
- Return user document otherwise

```typescript
export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()
    if (!user || user.deletedAt) return null
    return user
  },
})
```

## Files

| File              | Action                      |
| ----------------- | --------------------------- |
| `convex/users.ts` | Edit - add getByEmail query |
