import { ConvexError, v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { generateSlug, makeSlugUnique } from './lib/slug'

export const create = mutation({
  args: {
    authKitId: v.string(),
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

    // Generate slug from name
    const baseSlug = generateSlug(args.name)
    if (!baseSlug) {
      throw new ConvexError({
        code: 'INVALID_INPUT',
        message: 'Name must contain at least one alphanumeric character',
      })
    }

    // Get existing slugs to ensure uniqueness
    const existingOrgs = await ctx.db
      .query('organizations')
      .withIndex('by_slug')
      .collect()
    const existingSlugs = existingOrgs.map((org) => org.slug)
    const slug = makeSlugUnique(baseSlug, existingSlugs)

    const now = Date.now()
    const orgId = await ctx.db.insert('organizations', {
      name: args.name,
      slug,
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
    })

    // Create owner membership
    await ctx.db.insert('organizationMemberships', {
      organizationId: orgId,
      userId: user._id,
      role: 'owner',
      joinedAt: now,
    })

    return await ctx.db.get('organizations', orgId)
  },
})

export const getByOwner = query({
  args: {
    authKitId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by authKitId
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      return []
    }

    const orgs = await ctx.db
      .query('organizations')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .collect()

    // Sort by createdAt descending (newest first)
    return orgs.sort((a, b) => b.createdAt - a.createdAt)
  },
})

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first()

    if (!org) {
      return null
    }

    // Include owner info
    const owner = await ctx.db.get('users', org.ownerId)

    return {
      ...org,
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

export const getById = query({
  args: {
    id: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get('organizations', args.id)
  },
})

export const update = mutation({
  args: {
    authKitId: v.string(),
    id: v.id('organizations'),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get('organizations', args.id)
    if (!org) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Organization not found',
      })
    }

    // Verify caller is owner or admin
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', args.id).eq('userId', user._id),
      )
      .first()

    if (!membership || membership.role === 'member') {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Only admins and owners can update organization settings',
      })
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    }

    // If name changed, regenerate slug
    if (args.name !== undefined && args.name !== org.name) {
      const baseSlug = generateSlug(args.name)
      if (!baseSlug) {
        throw new ConvexError({
          code: 'INVALID_INPUT',
          message: 'Name must contain at least one alphanumeric character',
        })
      }

      // Get existing slugs (excluding current org)
      const existingOrgs = await ctx.db
        .query('organizations')
        .withIndex('by_slug')
        .collect()
      const existingSlugs = existingOrgs
        .filter((o) => o._id !== org._id)
        .map((o) => o.slug)
      const slug = makeSlugUnique(baseSlug, existingSlugs)

      updates.name = args.name
      updates.slug = slug
    }

    await ctx.db.patch('organizations', args.id, updates)
    return await ctx.db.get('organizations', args.id)
  },
})

export const delete_ = mutation({
  args: {
    authKitId: v.string(),
    id: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get('organizations', args.id)
    if (!org) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Organization not found',
      })
    }

    // Verify caller is owner
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', args.id).eq('userId', user._id),
      )
      .first()

    if (!membership || membership.role !== 'owner') {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Only the owner can delete the organization',
      })
    }

    // Check if org has profiles
    const profiles = await ctx.db
      .query('paymentOrderProfiles')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.id))
      .first()

    if (profiles) {
      throw new ConvexError({
        code: 'HAS_DEPENDENCIES',
        message:
          'Cannot delete organization with payment order profiles. Delete profiles first.',
      })
    }

    // Delete all memberships
    const memberships = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.id))
      .collect()
    for (const m of memberships) {
      await ctx.db.delete('organizationMemberships', m._id)
    }

    // Delete all invites
    const invites = await ctx.db
      .query('organizationInvites')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.id))
      .collect()
    for (const inv of invites) {
      await ctx.db.delete('organizationInvites', inv._id)
    }

    await ctx.db.delete('organizations', args.id)
    return { deleted: args.id }
  },
})
