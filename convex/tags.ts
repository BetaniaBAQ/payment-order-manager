import { ConvexError, v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { fileRequirementValidator } from './schema/tags'
import type { Id } from './_generated/dataModel'

export const create = mutation({
  args: {
    authKitId: v.string(),
    profileId: v.id('paymentOrderProfiles'),
    name: v.string(),
    color: v.string(),
    description: v.optional(v.string()),
    fileRequirements: v.optional(v.array(fileRequirementValidator)),
  },
  handler: async (ctx, args) => {
    // Verify caller is profile owner
    const profile = await ctx.db.get('paymentOrderProfiles', args.profileId)
    if (!profile) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }
    const owner = await ctx.db.get('users', profile.ownerId)
    if (!owner || owner.authKitId !== args.authKitId) {
      throw new ConvexError({ code: 'FORBIDDEN', message: 'Not authorized' })
    }

    // Check name uniqueness within profile
    const existing = await ctx.db
      .query('tags')
      .withIndex('by_profile_and_name', (q) =>
        q.eq('profileId', args.profileId).eq('name', args.name),
      )
      .first()

    if (existing) {
      throw new ConvexError({
        code: 'DUPLICATE',
        message: 'A tag with this name already exists in this profile',
      })
    }

    // Validate color is hex format
    if (!/^#[0-9A-Fa-f]{6}$/.test(args.color)) {
      throw new ConvexError({
        code: 'INVALID_INPUT',
        message: 'Color must be in hex format (#RRGGBB)',
      })
    }

    const now = Date.now()
    const tagId = await ctx.db.insert('tags', {
      profileId: args.profileId,
      name: args.name,
      color: args.color,
      description: args.description,
      fileRequirements: args.fileRequirements,
      createdAt: now,
      updatedAt: now,
    })

    return await ctx.db.get('tags', tagId)
  },
})

export const getById = query({
  args: {
    id: v.id('tags'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get('tags', args.id)
  },
})

export const getByProfile = query({
  args: {
    profileId: v.id('paymentOrderProfiles'),
  },
  handler: async (ctx, args) => {
    const tags = await ctx.db
      .query('tags')
      .withIndex('by_profile', (q) => q.eq('profileId', args.profileId))
      .collect()

    // Sort alphabetically by name
    return tags.sort((a, b) => a.name.localeCompare(b.name))
  },
})

export const update = mutation({
  args: {
    authKitId: v.string(),
    id: v.id('tags'),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    description: v.optional(v.string()),
    fileRequirements: v.optional(v.array(fileRequirementValidator)),
  },
  handler: async (ctx, args) => {
    const tag = await ctx.db.get('tags', args.id)
    if (!tag) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Tag not found' })
    }

    // Verify caller is profile owner
    const profile = await ctx.db.get('paymentOrderProfiles', tag.profileId)
    if (!profile) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }
    const owner = await ctx.db.get('users', profile.ownerId)
    if (!owner || owner.authKitId !== args.authKitId) {
      throw new ConvexError({ code: 'FORBIDDEN', message: 'Not authorized' })
    }

    // If name changed, check uniqueness
    if (args.name !== undefined && args.name !== tag.name) {
      const newName = args.name
      const existing = await ctx.db
        .query('tags')
        .withIndex('by_profile_and_name', (q) =>
          q.eq('profileId', tag.profileId).eq('name', newName),
        )
        .first()

      if (existing) {
        throw new ConvexError({
          code: 'DUPLICATE',
          message: 'A tag with this name already exists in this profile',
        })
      }
    }

    // Validate color if provided
    if (args.color !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(args.color)) {
      throw new ConvexError({
        code: 'INVALID_INPUT',
        message: 'Color must be in hex format (#RRGGBB)',
      })
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    }
    if (args.name !== undefined) updates.name = args.name
    if (args.color !== undefined) updates.color = args.color
    if (args.description !== undefined) updates.description = args.description
    if (args.fileRequirements !== undefined)
      updates.fileRequirements = args.fileRequirements

    await ctx.db.patch('tags', args.id, updates)
    return await ctx.db.get('tags', args.id)
  },
})

export const delete_ = mutation({
  args: {
    authKitId: v.string(),
    id: v.id('tags'),
  },
  handler: async (ctx, args) => {
    const tag = await ctx.db.get('tags', args.id)
    if (!tag) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Tag not found' })
    }

    // Verify caller is profile owner
    const profile = await ctx.db.get('paymentOrderProfiles', tag.profileId)
    if (!profile) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }
    const owner = await ctx.db.get('users', profile.ownerId)
    if (!owner || owner.authKitId !== args.authKitId) {
      throw new ConvexError({ code: 'FORBIDDEN', message: 'Not authorized' })
    }

    // Clear tagId from all payment orders that use this tag
    const ordersWithTag = await ctx.db
      .query('paymentOrders')
      .withIndex('by_tag', (q) => q.eq('tagId', args.id))
      .collect()

    for (const order of ordersWithTag) {
      await ctx.db.patch('paymentOrders', order._id, {
        tagId: undefined as unknown as Id<'tags'>,
        updatedAt: Date.now(),
      })
    }

    // Delete the tag
    await ctx.db.delete('tags', args.id)

    return { deleted: args.id, ordersUpdated: ordersWithTag.length }
  },
})
