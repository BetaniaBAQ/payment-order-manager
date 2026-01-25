# TASK-2.10: Create Convex function: users.getById

## Summary

Add query to fetch user by Convex document ID, respecting soft delete.

## Questions (for user)

None - requirements are clear.

## Changes

### `convex/users.ts`

Add `getById` query:

- Arg: `id: v.id('users')`
- Use `ctx.db.get(id)` for direct lookup (per convex rules)
- Return `null` if not found OR if `deletedAt` is set
- Return user document otherwise

```typescript
export const getById = query({
  args: {
    id: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id)
    if (!user || user.deletedAt) return null
    return user
  },
})
```

## Files

| File              | Action                   |
| ----------------- | ------------------------ |
| `convex/users.ts` | Edit - add getById query |
