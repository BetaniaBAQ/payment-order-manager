# 0001: Super admin helpers

## Context

Platform-level super admin authorization via env-var email list. No DB role column — just a helper that checks the authenticated user's email against `SUPER_ADMIN_EMAILS`. Used by all admin queries/mutations.

## Dependencies

None

## File

`convex/lib/admin.ts` (new)

## Requirements

1. Read `SUPER_ADMIN_EMAILS` from `process.env` inside Convex (available via Convex dashboard env vars)
2. Split by comma, trim whitespace, lowercase

```typescript
function getSuperAdminEmails(): string[] {
  const raw = process.env.SUPER_ADMIN_EMAILS ?? ''
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}
```

3. `isSuperAdmin(email: string): boolean` — checks if email is in the list
4. `assertSuperAdmin(ctx, authKitId)` — fetches user by `authKitId` index on `users` table, throws if email not in list

```typescript
export async function assertSuperAdmin(
  ctx: { db: DatabaseReader },
  authKitId: string,
): Promise<void> {
  const user = await ctx.db
    .query('users')
    .withIndex('by_authKitId', (q) => q.eq('authKitId', authKitId))
    .unique()
  if (!user || !isSuperAdmin(user.email)) {
    throw new ConvexError({ code: 'FORBIDDEN', message: 'Not a super admin' })
  }
}
```

- Import `DatabaseReader` from `convex/server`
- Import `ConvexError` from `convex/values`
- Reference existing index: `users` table has `by_authKitId` index (`convex/schema/users.ts`)

## No-gos

- No DB column for admin role — env var only
- No caching — email list is small, read on every call is fine

## Definition of Done

- [ ] File exists at `convex/lib/admin.ts`
- [ ] Exports `isSuperAdmin` and `assertSuperAdmin`
- [ ] `assertSuperAdmin` throws `ConvexError` with `code: 'FORBIDDEN'` for non-admins
- [ ] Handles missing/empty env var gracefully (empty list → no admins)
- [ ] No TypeScript errors
