import { ConvexError } from 'convex/values'

import type { MutationCtx, QueryCtx } from '../_generated/server'

function getSuperAdminEmails(): Array<string> {
  const raw = process.env.SUPER_ADMIN_EMAILS ?? ''
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isSuperAdmin(email: string): boolean {
  return getSuperAdminEmails().includes(email.toLowerCase())
}

export async function assertSuperAdmin(
  ctx: QueryCtx | MutationCtx,
  authKitId: string,
): Promise<void> {
  const user = await ctx.db
    .query('users')
    .withIndex('by_authKitId', (q) => q.eq('authKitId', authKitId))
    .first()

  if (!user || user.deletedAt) {
    throw new ConvexError({ code: 'FORBIDDEN', message: 'Not authorized' })
  }

  if (!isSuperAdmin(user.email)) {
    throw new ConvexError({ code: 'FORBIDDEN', message: 'Not authorized' })
  }
}
