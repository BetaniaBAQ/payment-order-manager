import { ConvexError, v } from 'convex/values'

import { internalMutation, internalQuery, query } from './_generated/server'
import { inviteRoleValidator } from './schema/organizationInvites'

export const INVITE_EXPIRY_DAYS = 7

// Internal query to get user by authKitId
export const getUserByAuthKitId = internalQuery({
  args: { authKitId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()
  },
})

// Internal query to check membership
export const getMembership = internalQuery({
  args: {
    organizationId: v.id('organizations'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', args.organizationId).eq('userId', args.userId),
      )
      .first()
  },
})

// Internal mutation to create invite record
export const createInvite = internalMutation({
  args: {
    organizationId: v.id('organizations'),
    email: v.string(),
    role: inviteRoleValidator,
    token: v.string(),
    invitedBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Check for existing pending invite
    const existingInvites = await ctx.db
      .query('organizationInvites')
      .withIndex('by_organization_and_status', (q) =>
        q.eq('organizationId', args.organizationId).eq('status', 'pending'),
      )
      .collect()

    const existingForEmail = existingInvites.find(
      (inv) => inv.email.toLowerCase() === args.email.toLowerCase(),
    )

    if (existingForEmail) {
      throw new ConvexError({
        code: 'ALREADY_EXISTS',
        message: 'An invite is already pending for this email',
      })
    }

    const now = Date.now()
    const expiresAt = now + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000

    const inviteId = await ctx.db.insert('organizationInvites', {
      organizationId: args.organizationId,
      email: args.email.toLowerCase(),
      role: args.role,
      token: args.token,
      invitedBy: args.invitedBy,
      invitedAt: now,
      expiresAt,
      status: 'pending',
    })

    return await ctx.db.get('organizationInvites', inviteId)
  },
})

// Internal query to get org by id
export const getOrganization = internalQuery({
  args: { id: v.id('organizations') },
  handler: async (ctx, args) => {
    return await ctx.db.get('organizations', args.id)
  },
})

// Internal query to get user by id
export const getUser = internalQuery({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get('users', args.id)
  },
})

export const getByOrganization = query({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const invites = await ctx.db
      .query('organizationInvites')
      .withIndex('by_organization_and_status', (q) =>
        q.eq('organizationId', args.organizationId).eq('status', 'pending'),
      )
      .collect()

    // Check for expired invites and filter them
    const now = Date.now()
    const validInvites = invites.filter((invite) => invite.expiresAt > now)

    // Include inviter info
    return await Promise.all(
      validInvites.map(async (invite) => {
        const inviter = await ctx.db.get('users', invite.invitedBy)
        return {
          ...invite,
          inviter: inviter
            ? {
                _id: inviter._id,
                name: inviter.name,
                email: inviter.email,
              }
            : null,
        }
      }),
    )
  },
})

export const getByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query('organizationInvites')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first()

    if (!invite) {
      return null
    }

    // Check if expired
    if (invite.expiresAt < Date.now()) {
      return { ...invite, status: 'expired' as const }
    }

    // Get org info
    const org = await ctx.db.get('organizations', invite.organizationId)
    const inviter = await ctx.db.get('users', invite.invitedBy)

    return {
      ...invite,
      organization: org
        ? {
            _id: org._id,
            name: org.name,
            slug: org.slug,
          }
        : null,
      inviter: inviter
        ? {
            _id: inviter._id,
            name: inviter.name,
            email: inviter.email,
          }
        : null,
    }
  },
})

// Internal mutation to create membership from invite
export const acceptInvite = internalMutation({
  args: {
    token: v.string(),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query('organizationInvites')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first()

    if (!invite) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Invite not found' })
    }

    if (invite.status !== 'pending') {
      throw new ConvexError({
        code: 'INVALID_STATE',
        message: 'Invite is no longer valid',
      })
    }

    if (invite.expiresAt < Date.now()) {
      await ctx.db.patch('organizationInvites', invite._id, {
        status: 'expired',
      })
      throw new ConvexError({ code: 'EXPIRED', message: 'Invite has expired' })
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', invite.organizationId).eq('userId', args.userId),
      )
      .first()

    if (existingMembership) {
      // Mark invite as accepted anyway
      await ctx.db.patch('organizationInvites', invite._id, {
        status: 'accepted',
      })
      throw new ConvexError({
        code: 'ALREADY_EXISTS',
        message: 'You are already a member of this organization',
      })
    }

    // Create membership
    const now = Date.now()
    await ctx.db.insert('organizationMemberships', {
      organizationId: invite.organizationId,
      userId: args.userId,
      role: invite.role,
      joinedAt: now,
      invitedBy: invite.invitedBy,
    })

    // Mark invite as accepted
    await ctx.db.patch('organizationInvites', invite._id, {
      status: 'accepted',
    })

    return await ctx.db.get('organizations', invite.organizationId)
  },
})

export const revoke = internalMutation({
  args: {
    authKitId: v.string(),
    inviteId: v.id('organizationInvites'),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get('organizationInvites', args.inviteId)
    if (!invite) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Invite not found' })
    }

    // Get caller
    const caller = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!caller) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    // Check caller's membership
    const callerMembership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', invite.organizationId).eq('userId', caller._id),
      )
      .first()

    if (!callerMembership || callerMembership.role === 'member') {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Only admins and owners can revoke invites',
      })
    }

    await ctx.db.delete('organizationInvites', args.inviteId)
    return { deleted: args.inviteId }
  },
})
