import { ConvexError, v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { generateSlug, makeSlugUnique } from './lib/slug'

export const create = mutation({
  args: {
    authKitId: v.string(),
    organizationId: v.id('organizations'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by authKitId
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    // Verify user is org owner
    const org = await ctx.db.get('organizations', args.organizationId)
    if (!org) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Organization not found',
      })
    }
    if (org.ownerId !== user._id) {
      throw new ConvexError({ code: 'FORBIDDEN', message: 'Not authorized' })
    }

    // Enforce ONE profile per user constraint
    const existingProfile = await ctx.db
      .query('paymentOrderProfiles')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .first()

    if (existingProfile) {
      throw new ConvexError({
        code: 'LIMIT_EXCEEDED',
        message: 'You can only have one payment order profile',
      })
    }

    // Generate slug from name
    const baseSlug = generateSlug(args.name)
    if (!baseSlug) {
      throw new ConvexError({
        code: 'INVALID_INPUT',
        message: 'Name must contain at least one alphanumeric character',
      })
    }

    // Get existing slugs within org to ensure uniqueness
    const existingProfiles = await ctx.db
      .query('paymentOrderProfiles')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .collect()
    const existingSlugs = existingProfiles.map((p) => p.slug)
    const slug = makeSlugUnique(baseSlug, existingSlugs)

    const now = Date.now()
    const profileId = await ctx.db.insert('paymentOrderProfiles', {
      organizationId: args.organizationId,
      ownerId: user._id,
      name: args.name,
      slug,
      isPublic: false,
      allowedEmails: [],
      createdAt: now,
      updatedAt: now,
    })

    return await ctx.db.get('paymentOrderProfiles', profileId)
  },
})

export const getById = query({
  args: {
    id: v.id('paymentOrderProfiles'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get('paymentOrderProfiles', args.id)
  },
})

export const getByOwner = query({
  args: {
    authKitId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      return null
    }

    // Since one profile per user, return single profile or null
    return await ctx.db
      .query('paymentOrderProfiles')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .first()
  },
})

export const getByOrganization = query({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const profiles = await ctx.db
      .query('paymentOrderProfiles')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .collect()

    // Get payment order counts for each profile
    const profilesWithCounts = await Promise.all(
      profiles.map(async (profile) => {
        const orders = await ctx.db
          .query('paymentOrders')
          .withIndex('by_profile', (q) => q.eq('profileId', profile._id))
          .collect()

        return {
          ...profile,
          paymentOrderCount: orders.length,
        }
      }),
    )

    // Sort by createdAt
    return profilesWithCounts.sort((a, b) => a.createdAt - b.createdAt)
  },
})

export const getBySlug = query({
  args: {
    orgSlug: v.string(),
    profileSlug: v.string(),
  },
  handler: async (ctx, args) => {
    // Get organization by slug
    const org = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', args.orgSlug))
      .first()

    if (!org) {
      return null
    }

    // Get profile by org and slug
    const profile = await ctx.db
      .query('paymentOrderProfiles')
      .withIndex('by_org_and_slug', (q) =>
        q.eq('organizationId', org._id).eq('slug', args.profileSlug),
      )
      .first()

    if (!profile) {
      return null
    }

    // Include owner and org info
    const owner = await ctx.db.get('users', profile.ownerId)

    return {
      ...profile,
      organization: {
        _id: org._id,
        name: org.name,
        slug: org.slug,
      },
      owner: owner
        ? {
            _id: owner._id,
            name: owner.name,
            email: owner.email,
            avatarUrl: owner.avatarUrl,
          }
        : null,
    }
  },
})

export const update = mutation({
  args: {
    authKitId: v.string(),
    id: v.id('paymentOrderProfiles'),
    name: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get('paymentOrderProfiles', args.id)
    if (!profile) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }

    // Verify caller is owner
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user || user._id !== profile.ownerId) {
      throw new ConvexError({ code: 'FORBIDDEN', message: 'Not authorized' })
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    }

    if (args.name !== undefined) {
      updates.name = args.name
      // Note: We don't regenerate slug on name change to preserve existing links
    }

    if (args.isPublic !== undefined) {
      updates.isPublic = args.isPublic
    }

    await ctx.db.patch('paymentOrderProfiles', args.id, updates)
    return await ctx.db.get('paymentOrderProfiles', args.id)
  },
})

export const togglePublic = mutation({
  args: {
    authKitId: v.string(),
    id: v.id('paymentOrderProfiles'),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get('paymentOrderProfiles', args.id)
    if (!profile) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }

    // Verify caller is owner
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user || user._id !== profile.ownerId) {
      throw new ConvexError({ code: 'FORBIDDEN', message: 'Not authorized' })
    }

    const newIsPublic = !profile.isPublic
    await ctx.db.patch('paymentOrderProfiles', args.id, {
      isPublic: newIsPublic,
      updatedAt: Date.now(),
    })

    return { isPublic: newIsPublic }
  },
})

export const updateAllowedEmails = mutation({
  args: {
    authKitId: v.string(),
    id: v.id('paymentOrderProfiles'),
    operation: v.union(v.literal('add'), v.literal('remove'), v.literal('set')),
    emails: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get('paymentOrderProfiles', args.id)
    if (!profile) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }

    // Verify caller is owner
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user || user._id !== profile.ownerId) {
      throw new ConvexError({ code: 'FORBIDDEN', message: 'Not authorized' })
    }

    // Validate and normalize emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const normalizedEmails = args.emails.map((e) => e.toLowerCase().trim())

    for (const email of normalizedEmails) {
      if (!emailRegex.test(email)) {
        throw new ConvexError({
          code: 'INVALID_INPUT',
          message: `Invalid email format: ${email}`,
        })
      }
    }

    let newAllowedEmails: Array<string>

    switch (args.operation) {
      case 'add': {
        const existing = new Set(profile.allowedEmails)
        normalizedEmails.forEach((e) => existing.add(e))
        newAllowedEmails = Array.from(existing)
        break
      }
      case 'remove': {
        const toRemove = new Set(normalizedEmails)
        newAllowedEmails = profile.allowedEmails.filter((e) => !toRemove.has(e))
        break
      }
      case 'set': {
        newAllowedEmails = [...new Set(normalizedEmails)]
        break
      }
    }

    // Enforce maximum limit
    const MAX_ALLOWED_EMAILS = 100
    if (newAllowedEmails.length > MAX_ALLOWED_EMAILS) {
      throw new ConvexError({
        code: 'LIMIT_EXCEEDED',
        message: `Maximum ${MAX_ALLOWED_EMAILS} allowed emails permitted`,
      })
    }

    await ctx.db.patch('paymentOrderProfiles', args.id, {
      allowedEmails: newAllowedEmails,
      updatedAt: Date.now(),
    })

    return await ctx.db.get('paymentOrderProfiles', args.id)
  },
})

export const delete_ = mutation({
  args: {
    authKitId: v.string(),
    id: v.id('paymentOrderProfiles'),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get('paymentOrderProfiles', args.id)
    if (!profile) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }

    // Verify caller is owner
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user || user._id !== profile.ownerId) {
      throw new ConvexError({ code: 'FORBIDDEN', message: 'Not authorized' })
    }

    // Check for existing payment orders
    const orders = await ctx.db
      .query('paymentOrders')
      .withIndex('by_profile', (q) => q.eq('profileId', args.id))
      .first()

    if (orders) {
      throw new ConvexError({
        code: 'HAS_DEPENDENCIES',
        message:
          'Cannot delete profile with payment orders. Archive or delete orders first.',
      })
    }

    // Delete associated tags
    const tags = await ctx.db
      .query('tags')
      .withIndex('by_profile', (q) => q.eq('profileId', args.id))
      .collect()

    for (const tag of tags) {
      await ctx.db.delete('tags', tag._id)
    }

    await ctx.db.delete('paymentOrderProfiles', args.id)
    return { deleted: args.id, tagsDeleted: tags.length }
  },
})
