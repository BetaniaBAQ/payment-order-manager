import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const users = defineTable({
  authKitId: v.string(),
  email: v.string(),
  name: v.string(),
  avatarUrl: v.optional(v.string()),
  language: v.optional(v.string()),
  theme: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
})
  .index('by_authKitId', ['authKitId'])
  .index('by_email', ['email'])
