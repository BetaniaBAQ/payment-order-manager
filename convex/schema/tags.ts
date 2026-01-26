import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const fileRequirementValidator = v.object({
  label: v.string(),
  description: v.optional(v.string()),
  allowedMimeTypes: v.array(v.string()),
  maxFileSizeMB: v.optional(v.number()),
  required: v.boolean(),
})

export const tags = defineTable({
  profileId: v.id('paymentOrderProfiles'),
  name: v.string(),
  color: v.string(),
  description: v.optional(v.string()),
  fileRequirements: v.optional(v.array(fileRequirementValidator)),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_profile', ['profileId'])
  .index('by_profile_and_name', ['profileId', 'name'])
