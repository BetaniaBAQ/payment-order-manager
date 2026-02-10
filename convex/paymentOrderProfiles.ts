import { ConvexError, v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { checkProfileLimit } from './lib/checkLimits'
import { generateSlug, makeSlugUnique } from './lib/slug'

export const create = mutation({
  args: {
    authKitId: v.string(),
    organizationId: v.id('organizations'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    // Get organization
    const org = await ctx.db.get('organizations', args.organizationId)
    if (!org) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Organization not found',
      })
    }

    // Check if user is org admin/owner
    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', args.organizationId).eq('userId', user._id),
      )
      .first()

    const isOrgAdminOrOwner = membership && membership.role !== 'member'

    if (!isOrgAdminOrOwner) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Only organization admins and owners can create profiles',
      })
    }

    // Check profile limit
    const profileLimit = await checkProfileLimit(ctx, args.organizationId)
    if (!profileLimit.allowed) {
      throw new ConvexError({
        code: 'LIMIT_REACHED',
        message: `Plan ${profileLimit.tier} limit: ${profileLimit.limit} profiles`,
        tier: profileLimit.tier,
        limit: profileLimit.limit,
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

    // Get existing slugs in this org to ensure uniqueness
    const existingProfiles = await ctx.db
      .query('paymentOrderProfiles')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .collect()

    const existingSlugs = existingProfiles.map((p) => p.slug)
    const slug = makeSlugUnique(baseSlug, existingSlugs)

    // Create profile
    const now = Date.now()
    const profileId = await ctx.db.insert('paymentOrderProfiles', {
      organizationId: args.organizationId,
      ownerId: user._id,
      name: args.name,
      slug,
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

export const checkAccess = query({
  args: {
    profileId: v.id('paymentOrderProfiles'),
    authKitId: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get('paymentOrderProfiles', args.profileId)
    if (!profile) {
      return { hasAccess: false, role: null }
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      return { hasAccess: false, role: null }
    }

    // Check if user is profile owner
    if (user._id === profile.ownerId) {
      return { hasAccess: true, role: 'owner' as const }
    }

    // Check if user is org member (admin or owner)
    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', profile.organizationId).eq('userId', user._id),
      )
      .first()

    if (membership && membership.role !== 'member') {
      return { hasAccess: true, role: 'admin' as const }
    }

    if (membership) {
      return { hasAccess: true, role: 'member' as const }
    }

    // Check if user email is in whitelist
    const userEmail = user.email.toLowerCase()
    if (profile.allowedEmails.includes(userEmail)) {
      return { hasAccess: true, role: 'whitelisted' as const }
    }

    return { hasAccess: false, role: null }
  },
})

export const update = mutation({
  args: {
    authKitId: v.string(),
    id: v.id('paymentOrderProfiles'),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get('paymentOrderProfiles', args.id)
    if (!profile) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }

    // Verify caller is profile owner OR org admin+
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    const isProfileOwner = user._id === profile.ownerId
    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', profile.organizationId).eq('userId', user._id),
      )
      .first()
    const isOrgAdminOrOwner = membership && membership.role !== 'member'

    if (!isProfileOwner && !isOrgAdminOrOwner) {
      throw new ConvexError({ code: 'FORBIDDEN', message: 'Not authorized' })
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    }

    if (args.name !== undefined && args.name !== profile.name) {
      const slug = generateSlug(args.name)
      if (!slug) {
        throw new ConvexError({
          code: 'INVALID_INPUT',
          message: 'Name must contain at least one alphanumeric character',
        })
      }

      // Check if slug already exists within org (excluding current profile)
      const existingProfile = await ctx.db
        .query('paymentOrderProfiles')
        .withIndex('by_org_and_slug', (q) =>
          q.eq('organizationId', profile.organizationId).eq('slug', slug),
        )
        .first()

      if (existingProfile && existingProfile._id !== profile._id) {
        throw new ConvexError({
          code: 'CONFLICT',
          message:
            'A profile with this name already exists in the organization',
        })
      }

      updates.name = args.name
      updates.slug = slug
    }

    await ctx.db.patch('paymentOrderProfiles', args.id, updates)
    return await ctx.db.get('paymentOrderProfiles', args.id)
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

    // Verify caller is profile owner OR org admin+
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    const isProfileOwner = user._id === profile.ownerId
    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', profile.organizationId).eq('userId', user._id),
      )
      .first()
    const isOrgAdminOrOwner = membership && membership.role !== 'member'

    if (!isProfileOwner && !isOrgAdminOrOwner) {
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

    // Verify caller is profile owner OR org owner
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    const isProfileOwner = user._id === profile.ownerId
    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', profile.organizationId).eq('userId', user._id),
      )
      .first()
    const isOrgOwner = membership?.role === 'owner'

    if (!isProfileOwner && !isOrgOwner) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message:
          'Only the profile owner or organization owner can delete profiles',
      })
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
