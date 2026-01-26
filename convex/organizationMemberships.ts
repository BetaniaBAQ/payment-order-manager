import { ConvexError, v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { membershipRoleValidator } from './schema/organizationMemberships'
import type { MembershipRole } from './schema/organizationMemberships'

/**
 * Role hierarchy for permission checks.
 * Higher number = more permissions.
 */
const ROLE_HIERARCHY: Record<MembershipRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
}

/**
 * Check if a role has at least the required permission level.
 */
function hasPermission(
  userRole: MembershipRole,
  requiredRole: MembershipRole,
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export const getByOrganization = query({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .collect()

    // Fetch user info for each membership
    const membersWithUsers = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get('users', membership.userId)
        return {
          ...membership,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
              }
            : null,
        }
      }),
    )

    // Sort by role (owner first, then admin, then member)
    return membersWithUsers.sort(
      (a, b) => ROLE_HIERARCHY[b.role] - ROLE_HIERARCHY[a.role],
    )
  },
})

export const getByUser = query({
  args: {
    authKitId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      return []
    }

    const memberships = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()

    // Fetch organization info for each membership
    const orgsWithMembership = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get('organizations', membership.organizationId)
        return org
          ? {
              ...org,
              membership: {
                role: membership.role,
                joinedAt: membership.joinedAt,
              },
            }
          : null
      }),
    )

    // Filter out null orgs and sort by joinedAt descending
    return orgsWithMembership
      .filter((org): org is NonNullable<typeof org> => org !== null)
      .sort((a, b) => b.membership.joinedAt - a.membership.joinedAt)
  },
})

export const getMemberRole = query({
  args: {
    organizationId: v.id('organizations'),
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

    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', args.organizationId).eq('userId', user._id),
      )
      .first()

    return membership ? membership.role : null
  },
})

export const addMember = mutation({
  args: {
    authKitId: v.string(),
    organizationId: v.id('organizations'),
    userId: v.id('users'),
    role: membershipRoleValidator,
  },
  handler: async (ctx, args) => {
    // Cannot add someone as owner (owner is set at org creation)
    if (args.role === 'owner') {
      throw new ConvexError({
        code: 'INVALID_INPUT',
        message:
          'Cannot add a member as owner. Use transfer ownership instead.',
      })
    }

    // Get caller
    const caller = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!caller) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    // Check caller's membership (must be admin or owner)
    const callerMembership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', args.organizationId).eq('userId', caller._id),
      )
      .first()

    if (!callerMembership || !hasPermission(callerMembership.role, 'admin')) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Only admins and owners can add members',
      })
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', args.organizationId).eq('userId', args.userId),
      )
      .first()

    if (existingMembership) {
      throw new ConvexError({
        code: 'ALREADY_EXISTS',
        message: 'User is already a member of this organization',
      })
    }

    // Verify target user exists
    const targetUser = await ctx.db.get('users', args.userId)
    if (!targetUser) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Target user not found',
      })
    }

    const now = Date.now()
    const membershipId = await ctx.db.insert('organizationMemberships', {
      organizationId: args.organizationId,
      userId: args.userId,
      role: args.role,
      joinedAt: now,
      invitedBy: caller._id,
    })

    return await ctx.db.get('organizationMemberships', membershipId)
  },
})

export const removeMember = mutation({
  args: {
    authKitId: v.string(),
    organizationId: v.id('organizations'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
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
        q.eq('organizationId', args.organizationId).eq('userId', caller._id),
      )
      .first()

    if (!callerMembership || !hasPermission(callerMembership.role, 'admin')) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Only admins and owners can remove members',
      })
    }

    // Get target membership
    const targetMembership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', args.organizationId).eq('userId', args.userId),
      )
      .first()

    if (!targetMembership) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'User is not a member of this organization',
      })
    }

    // Cannot remove owner
    if (targetMembership.role === 'owner') {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Cannot remove the organization owner',
      })
    }

    // Admin cannot remove other admins (only owner can)
    if (
      callerMembership.role === 'admin' &&
      targetMembership.role === 'admin'
    ) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Admins cannot remove other admins',
      })
    }

    await ctx.db.delete('organizationMemberships', targetMembership._id)
    return { deleted: targetMembership._id }
  },
})

export const updateRole = mutation({
  args: {
    authKitId: v.string(),
    organizationId: v.id('organizations'),
    userId: v.id('users'),
    newRole: membershipRoleValidator,
  },
  handler: async (ctx, args) => {
    // Cannot change to/from owner via this function
    if (args.newRole === 'owner') {
      throw new ConvexError({
        code: 'INVALID_INPUT',
        message: 'Cannot change role to owner. Use transfer ownership instead.',
      })
    }

    // Get caller
    const caller = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!caller) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    // Only owner can change roles
    const callerMembership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', args.organizationId).eq('userId', caller._id),
      )
      .first()

    if (!callerMembership || callerMembership.role !== 'owner') {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Only the owner can change member roles',
      })
    }

    // Get target membership
    const targetMembership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', args.organizationId).eq('userId', args.userId),
      )
      .first()

    if (!targetMembership) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'User is not a member of this organization',
      })
    }

    // Cannot change owner's role
    if (targetMembership.role === 'owner') {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Cannot change the owner role. Transfer ownership instead.',
      })
    }

    await ctx.db.patch('organizationMemberships', targetMembership._id, {
      role: args.newRole,
    })
    return await ctx.db.get('organizationMemberships', targetMembership._id)
  },
})
