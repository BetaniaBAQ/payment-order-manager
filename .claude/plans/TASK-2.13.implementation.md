# TASK-2.13: Create Convex function: users.getCurrentUser

## Summary

Add query to get current user by authKitId (passed from client).

## Questions (for user)

None - follows existing pattern of passing authKitId from client.

## Changes

### `convex/users.ts`

Add `getCurrentUser` query:

- Arg: `authKitId: v.string()`
- Use `by_authKitId` index
- Return user or null (excluding soft-deleted)

```typescript
export const getCurrentUser = query({
  args: {
    authKitId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()
    if (!user || user.deletedAt) return null
    return user
  },
})
```

## Files

| File              | Action                          |
| ----------------- | ------------------------------- |
| `convex/users.ts` | Edit - add getCurrentUser query |
