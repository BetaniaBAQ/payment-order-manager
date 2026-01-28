'use node'

import { ConvexError, v } from 'convex/values'

import { render } from '@react-email/render'

import { internal } from './_generated/api'
import { action } from './_generated/server'
import { resend } from './emails'
import { OrganizationInviteEmail } from './emails/organizationInvite'
import { OrganizationWelcomeEmail } from './emails/organizationWelcome'
import { INVITE_EXPIRY_DAYS } from './organizationInvitesInternal'
import { inviteRoleValidator } from './schema/organizationInvites'
import type { Doc, Id } from './_generated/dataModel'
import type { InviteRole } from './schema/organizationInvites'

type Organization = Doc<'organizations'>
type OrganizationInvite = Doc<'organizationInvites'>

const APP_URL = process.env.VITE_APP_URL ?? 'http://localhost:3000'
const EMAIL_FROM = 'Betania <noreply@betania.app>'

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

/**
 * Create an invite and send email.
 * This is an action because it renders React Email and sends via Resend.
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
      internal.organizationInvitesInternal.getUserByAuthKitId,
      {
        authKitId: args.authKitId,
      },
    )

    if (!caller) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    // Check caller's membership (must be admin or owner)
    const callerMembership = await ctx.runQuery(
      internal.organizationInvitesInternal.getMembership,
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
      internal.organizationInvitesInternal.createInvite,
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
      internal.organizationInvitesInternal.getOrganization,
      {
        id: args.organizationId,
      },
    )
    const inviter = await ctx.runQuery(
      internal.organizationInvitesInternal.getUser,
      {
        id: caller._id,
      },
    )

    // Send invite email
    if (org && inviter) {
      const inviteUrl = `${APP_URL}/invites/${token}`

      const html = await render(
        OrganizationInviteEmail({
          inviterName: inviter.name || inviter.email,
          organizationName: org.name,
          role: args.role === 'admin' ? 'an admin' : 'a member',
          inviteUrl,
          expiryDays: INVITE_EXPIRY_DAYS,
        }),
      )

      await resend.sendEmail(ctx, {
        from: EMAIL_FROM,
        to: args.email,
        subject: `You've been invited to join ${org.name} on Betania`,
        html,
      })
    }

    if (!invite) {
      return null
    }

    return {
      ...invite,
      inviteUrl: `${APP_URL}/invites/${token}`,
    }
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
      internal.organizationInvitesInternal.getUserByAuthKitId,
      {
        authKitId: args.authKitId,
      },
    )

    if (!user) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    // Accept invite and create membership
    const org = await ctx.runMutation(
      internal.organizationInvitesInternal.acceptInvite,
      {
        token: args.token,
        userId: user._id,
      },
    )

    // Send welcome email
    if (org && user.email) {
      const html = await render(
        OrganizationWelcomeEmail({
          organizationName: org.name,
          organizationUrl: `${APP_URL}/orgs/${org.slug}`,
        }),
      )

      await resend.sendEmail(ctx, {
        from: EMAIL_FROM,
        to: user.email,
        subject: `Welcome to ${org.name}!`,
        html,
      })
    }

    return org
  },
})
