import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const membershipRoleValidator = v.union(
  v.literal('owner'),
  v.literal('admin'),
  v.literal('member'),
)

export type MembershipRole = 'owner' | 'admin' | 'member'

export const organizationMemberships = defineTable({
  organizationId: v.id('organizations'),
  userId: v.id('users'),
  role: membershipRoleValidator,
  joinedAt: v.number(),
  invitedBy: v.optional(v.id('users')),
})
  .index('by_organization', ['organizationId'])
  .index('by_user', ['userId'])
  .index('by_organization_and_user', ['organizationId', 'userId'])
