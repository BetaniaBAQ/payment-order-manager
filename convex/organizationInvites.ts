import { ConvexError, v } from 'convex/values'

import { Resend } from 'resend'

import { internal } from './_generated/api'
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from './_generated/server'
import { inviteRoleValidator } from './schema/organizationInvites'
import type { Doc, Id } from './_generated/dataModel'
import type { InviteRole } from './schema/organizationInvites'

type Organization = Doc<'organizations'>
type OrganizationInvite = Doc<'organizationInvites'>

const INVITE_EXPIRY_DAYS = 7

/**
 * Generate a secure random token.
 */
function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  )
}

// Internal query to get user by authKitId
export const _getUserByAuthKitId = internalQuery({
  args: { authKitId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()
  },
})

// Internal query to check membership
export const _getMembership = internalQuery({
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
export const _createInvite = internalMutation({
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
export const _getOrganization = internalQuery({
  args: { id: v.id('organizations') },
  handler: async (ctx, args) => {
    return await ctx.db.get('organizations', args.id)
  },
})

// Internal query to get user by id
export const _getUser = internalQuery({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get('users', args.id)
  },
})

/**
 * Create an invite and send email.
 * This is an action because it calls external API (Resend).
 */
export const create = action({
  args: {
    authKitId: v.string(),
    organizationId: v.id('organizations'),
    email: v.string(),
    role: inviteRoleValidator,
  },
  handler: async (
    ctx,
    args: {
      authKitId: string
      organizationId: Id<'organizations'>
      email: string
      role: InviteRole
    },
  ): Promise<(OrganizationInvite & { inviteUrl: string }) | null> => {
    // Get caller
    const caller = await ctx.runQuery(
      internal.organizationInvites._getUserByAuthKitId,
      {
        authKitId: args.authKitId,
      },
    )

    if (!caller) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    // Check caller's membership (must be admin or owner)
    const callerMembership = await ctx.runQuery(
      internal.organizationInvites._getMembership,
      {
        organizationId: args.organizationId,
        userId: caller._id,
      },
    )

    if (!callerMembership || callerMembership.role === 'member') {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Only admins and owners can invite members',
      })
    }

    // Generate token
    const token = generateToken()

    // Create invite record
    const invite = await ctx.runMutation(
      internal.organizationInvites._createInvite,
      {
        organizationId: args.organizationId,
        email: args.email,
        role: args.role,
        token,
        invitedBy: caller._id,
      },
    )

    // Get org and inviter info for email
    const org = await ctx.runQuery(
      internal.organizationInvites._getOrganization,
      {
        id: args.organizationId,
      },
    )
    const inviter = await ctx.runQuery(internal.organizationInvites._getUser, {
      id: caller._id,
    })

    // Send invite email
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey && org && inviter) {
      const resend = new Resend(resendApiKey)
      const appUrl = process.env.VITE_APP_URL ?? 'http://localhost:3000'
      const inviteUrl = `${appUrl}/invites/${token}`

      await resend.emails.send({
        from: 'Betania <noreply@betania.app>',
        to: args.email,
        subject: `You've been invited to join ${org.name} on Betania`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You've been invited!</h2>
            <p>${inviter.name || inviter.email} has invited you to join <strong>${org.name}</strong> on Betania as ${args.role === 'admin' ? 'an admin' : 'a member'}.</p>
            <p style="margin: 24px 0;">
              <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accept Invitation
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">This invite expires in ${INVITE_EXPIRY_DAYS} days.</p>
            <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can ignore this email.</p>
          </div>
        `,
      })
    }

    if (!invite) {
      return null
    }

    return {
      ...invite,
      inviteUrl: `${process.env.VITE_APP_URL ?? 'http://localhost:3000'}/invites/${token}`,
    }
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
export const _acceptInvite = internalMutation({
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

/**
 * Accept an invite.
 * Creates membership and sends welcome email.
 */
export const accept = action({
  args: {
    authKitId: v.string(),
    token: v.string(),
  },
  handler: async (
    ctx,
    args: { authKitId: string; token: string },
  ): Promise<Organization | null> => {
    // Get user
    const user = await ctx.runQuery(
      internal.organizationInvites._getUserByAuthKitId,
      {
        authKitId: args.authKitId,
      },
    )

    if (!user) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    // Accept invite and create membership
    const org = await ctx.runMutation(
      internal.organizationInvites._acceptInvite,
      {
        token: args.token,
        userId: user._id,
      },
    )

    // Send welcome email
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey && org && user.email) {
      const resend = new Resend(resendApiKey)
      const appUrl = process.env.VITE_APP_URL ?? 'http://localhost:3000'

      await resend.emails.send({
        from: 'Betania <noreply@betania.app>',
        to: user.email,
        subject: `Welcome to ${org.name}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to ${org.name}!</h2>
            <p>You are now a member of <strong>${org.name}</strong> on Betania.</p>
            <p style="margin: 24px 0;">
              <a href="${appUrl}/orgs/${org.slug}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Go to Organization
              </a>
            </p>
          </div>
        `,
      })
    }

    return org
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
