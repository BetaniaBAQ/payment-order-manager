# TASK-2.12: Create Convex function: users.update

## Summary

Add mutation to update user data with auth validation.

## Questions (for user)

None - requirements are clear.

## Changes

### `convex/users.ts`

Add `update` mutation:

- Args: `id: v.id('users')`, `name?: v.optional(v.string())`, `avatarUrl?: v.optional(v.string())`
- Validate user exists and not soft-deleted
- Validate authenticated user matches (requires auth context - TBD how this works with WorkOS)
- Update only provided fields + `updatedAt`
- Return updated user

```typescript
export const update = mutation({
  args: {
    id: v.id('users'),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get('users', args.id)
    if (!user || user.deletedAt) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'User not found' })
    }

    // TODO: Validate authenticated user is the same (needs auth context)

    const updates: Partial<{
      name: string
      avatarUrl: string
      updatedAt: number
    }> = {
      updatedAt: Date.now(),
    }
    if (args.name !== undefined) updates.name = args.name
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl

    await ctx.db.patch('users', args.id, updates)
    return await ctx.db.get('users', args.id)
  },
})
```

## Files

| File              | Action                     |
| ----------------- | -------------------------- |
| `convex/users.ts` | Edit - add update mutation |
