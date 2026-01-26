import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const paymentOrderProfiles = defineTable({
  organizationId: v.id('organizations'),
  ownerId: v.id('users'),
  name: v.string(),
  slug: v.string(),
  allowedEmails: v.array(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_organization', ['organizationId'])
  .index('by_owner', ['ownerId'])
  .index('by_org_and_slug', ['organizationId', 'slug'])
