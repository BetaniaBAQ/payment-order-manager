import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const tags = defineTable({
  userId: v.id('users'),
  name: v.string(),
  color: v.string(),
  createdAt: v.number(),
}).index('by_user', ['userId'])
