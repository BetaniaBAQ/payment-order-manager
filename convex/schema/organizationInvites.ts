import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const inviteRoleValidator = v.union(
  v.literal('admin'),
  v.literal('member'),
)

export const inviteStatusValidator = v.union(
  v.literal('pending'),
  v.literal('accepted'),
  v.literal('expired'),
)

export type InviteRole = 'admin' | 'member'
export type InviteStatus = 'pending' | 'accepted' | 'expired'

export const organizationInvites = defineTable({
  organizationId: v.id('organizations'),
  email: v.string(),
  role: inviteRoleValidator,
  token: v.string(),
  invitedBy: v.id('users'),
  invitedAt: v.number(),
  expiresAt: v.number(),
  status: inviteStatusValidator,
})
  .index('by_organization', ['organizationId'])
  .index('by_email', ['email'])
  .index('by_token', ['token'])
  .index('by_organization_and_status', ['organizationId', 'status'])
