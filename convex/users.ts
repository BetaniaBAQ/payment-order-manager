import { ConvexError, v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const getById = query({
  args: {
    id: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get('users', args.id)
    if (!user || user.deletedAt) return null
    return user
  },
})

export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase()
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', normalizedEmail))
      .first()
    if (!user || user.deletedAt) return null
    return user
  },
})

export const getByAuthKitId = query({
  args: {
    authKitId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()
    if (!user || user.deletedAt) return null
    return user
  },
})

export const update = mutation({
  args: {
    id: v.id('users'),
    authKitId: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get('users', args.id)
    if (!user || user.deletedAt) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'User not found' })
    }

    // Validate caller is the user being updated
    if (user.authKitId !== args.authKitId) {
      throw new ConvexError({ code: 'FORBIDDEN', message: 'Not authorized' })
    }

    const updates: Record<string, string | number> = {
      updatedAt: Date.now(),
    }
    if (args.name !== undefined) updates.name = args.name
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl

    await ctx.db.patch('users', args.id, updates)
    return await ctx.db.get('users', args.id)
  },
})

export const getOrCreate = mutation({
  args: {
    authKitId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Search by authKitId
    const existing = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    const now = Date.now()

    // 2. If exists, update updatedAt and return
    if (existing) {
      await ctx.db.patch('users', existing._id, { updatedAt: now })
      return { ...existing, updatedAt: now }
    }

    // 3. Check for email conflict (different authKitId, same email)
    const emailConflict = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()

    if (emailConflict) {
      // TODO: Add Sentry logging after TASK-2.9.1
      throw new ConvexError({
        code: 'ACCOUNT_ERROR',
        message: 'Unable to create account. Please contact support.',
      })
    }

    // 4. Create new user
    const userId = await ctx.db.insert('users', {
      authKitId: args.authKitId,
      email: args.email,
      name: args.name,
      createdAt: now,
      updatedAt: now,
    })

    return await ctx.db.get('users', userId)
  },
})
