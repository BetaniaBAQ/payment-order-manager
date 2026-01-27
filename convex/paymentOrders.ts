import { ConvexError, v } from 'convex/values'

import { mutation, query } from './_generated/server'
import {
  HistoryAction,
  PaymentOrderStatus,
  VALID_TRANSITIONS,
  paymentOrderStatusValidator,
} from './schema/status'
import type { MembershipRole } from './schema/organizationMemberships'

// Permission context for status transitions
type PermissionContext = {
  isCreator: boolean
  isOrgAdminOrOwner: boolean
}

type PermissionChecker = (ctx: PermissionContext) => boolean

// Maps [currentStatus][newStatus] to permission checker
const TRANSITION_PERMISSIONS: Record<
  PaymentOrderStatus,
  Partial<Record<PaymentOrderStatus, PermissionChecker>>
> = {
  CREATED: {
    IN_REVIEW: ({ isCreator }) => isCreator,
    CANCELLED: ({ isCreator }) => isCreator,
  },
  IN_REVIEW: {
    APPROVED: ({ isOrgAdminOrOwner }) => isOrgAdminOrOwner,
    REJECTED: ({ isOrgAdminOrOwner }) => isOrgAdminOrOwner,
    NEEDS_SUPPORT: ({ isOrgAdminOrOwner }) => isOrgAdminOrOwner,
    CANCELLED: ({ isCreator, isOrgAdminOrOwner }) =>
      isCreator || isOrgAdminOrOwner,
  },
  NEEDS_SUPPORT: {
    IN_REVIEW: ({ isCreator }) => isCreator,
    CANCELLED: ({ isCreator, isOrgAdminOrOwner }) =>
      isCreator || isOrgAdminOrOwner,
  },
  APPROVED: {
    PAID: ({ isOrgAdminOrOwner }) => isOrgAdminOrOwner,
  },
  PAID: {
    RECONCILED: ({ isOrgAdminOrOwner }) => isOrgAdminOrOwner,
  },
  REJECTED: {},
  RECONCILED: {},
  CANCELLED: {},
}

export const create = mutation({
  args: {
    authKitId: v.string(),
    profileId: v.id('paymentOrderProfiles'),
    title: v.string(),
    description: v.optional(v.string()),
    reason: v.string(),
    amount: v.number(),
    currency: v.string(),
    tagId: v.optional(v.id('tags')),
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

    // Get profile
    const profile = await ctx.db.get('paymentOrderProfiles', args.profileId)
    if (!profile) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }

    // Check access using same logic as checkAccess
    const isProfileOwner = user._id === profile.ownerId

    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', profile.organizationId).eq('userId', user._id),
      )
      .first()

    const isOrgMember = !!membership
    const userEmail = user.email.toLowerCase()
    const isWhitelisted = profile.allowedEmails.includes(userEmail)

    if (!isProfileOwner && !isOrgMember && !isWhitelisted) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Not authorized to create orders in this profile',
      })
    }

    // Validate tag belongs to profile if provided
    if (args.tagId) {
      const tag = await ctx.db.get('tags', args.tagId)
      if (!tag || tag.profileId !== args.profileId) {
        throw new ConvexError({
          code: 'INVALID_INPUT',
          message: 'Invalid tag for this profile',
        })
      }
    }

    // Validate amount
    if (args.amount <= 0) {
      throw new ConvexError({
        code: 'INVALID_INPUT',
        message: 'Amount must be positive',
      })
    }

    const now = Date.now()
    const orderId = await ctx.db.insert('paymentOrders', {
      profileId: args.profileId,
      createdById: user._id,
      title: args.title,
      description: args.description,
      reason: args.reason,
      amount: args.amount,
      currency: args.currency,
      status: PaymentOrderStatus.CREATED,
      tagId: args.tagId,
      createdAt: now,
      updatedAt: now,
    })

    // Create initial history entry
    await ctx.db.insert('paymentOrderHistory', {
      paymentOrderId: orderId,
      userId: user._id,
      action: HistoryAction.CREATED,
      newStatus: PaymentOrderStatus.CREATED,
      createdAt: now,
    })

    return await ctx.db.get('paymentOrders', orderId)
  },
})

export const getByProfile = query({
  args: {
    profileId: v.id('paymentOrderProfiles'),
    authKitId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      return []
    }

    // Get profile
    const profile = await ctx.db.get('paymentOrderProfiles', args.profileId)
    if (!profile) {
      return []
    }

    // Check access and determine role
    const isProfileOwner = user._id === profile.ownerId

    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', profile.organizationId).eq('userId', user._id),
      )
      .first()

    const isOrgMember = !!membership
    const userEmail = user.email.toLowerCase()
    const isWhitelisted = profile.allowedEmails.includes(userEmail)

    // Check if user has any access
    if (!isProfileOwner && !isOrgMember && !isWhitelisted) {
      return []
    }

    // Fetch all orders for the profile
    let orders = await ctx.db
      .query('paymentOrders')
      .withIndex('by_profile', (q) => q.eq('profileId', args.profileId))
      .collect()

    // Whitelisted users can only see their own orders
    if (isWhitelisted && !isProfileOwner && !isOrgMember) {
      orders = orders.filter((order) => order.createdById === user._id)
    }

    // Enrich orders with creator info and tag
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const creator = await ctx.db.get('users', order.createdById)
        const tag = order.tagId ? await ctx.db.get('tags', order.tagId) : null

        return {
          ...order,
          creator: creator
            ? {
                _id: creator._id,
                name: creator.name,
                email: creator.email,
                avatarUrl: creator.avatarUrl,
              }
            : null,
          tag: tag
            ? {
                _id: tag._id,
                name: tag.name,
                color: tag.color,
              }
            : null,
        }
      }),
    )

    // Sort by createdAt desc (newest first)
    return enrichedOrders.sort((a, b) => b.createdAt - a.createdAt)
  },
})

export const getById = query({
  args: {
    id: v.id('paymentOrders'),
    authKitId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get('paymentOrders', args.id)
    if (!order) {
      return null
    }

    // Get user
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      return null
    }

    // Get profile
    const profile = await ctx.db.get('paymentOrderProfiles', order.profileId)
    if (!profile) {
      return null
    }

    // Check access
    const isProfileOwner = user._id === profile.ownerId

    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', profile.organizationId).eq('userId', user._id),
      )
      .first()

    const isOrgMember = !!membership
    const userEmail = user.email.toLowerCase()
    const isWhitelisted = profile.allowedEmails.includes(userEmail)

    // Check if user has any access
    if (!isProfileOwner && !isOrgMember && !isWhitelisted) {
      return null
    }

    // Whitelisted users can only see their own orders
    if (isWhitelisted && !isProfileOwner && !isOrgMember) {
      if (order.createdById !== user._id) {
        return null
      }
    }

    // Enrich order with creator info and tag
    const creator = await ctx.db.get('users', order.createdById)
    const tag = order.tagId ? await ctx.db.get('tags', order.tagId) : null

    return {
      ...order,
      creator: creator
        ? {
            _id: creator._id,
            name: creator.name,
            email: creator.email,
            avatarUrl: creator.avatarUrl,
          }
        : null,
      tag: tag
        ? {
            _id: tag._id,
            name: tag.name,
            color: tag.color,
          }
        : null,
    }
  },
})

export const updateStatus = mutation({
  args: {
    authKitId: v.string(),
    id: v.id('paymentOrders'),
    status: paymentOrderStatusValidator,
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Get order, validate exists
    const order = await ctx.db.get('paymentOrders', args.id)
    if (!order) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Payment order not found',
      })
    }

    // 2. Get user, validate exists
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
    }

    // 3. Get profile for permission check
    const profile = await ctx.db.get('paymentOrderProfiles', order.profileId)
    if (!profile) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }

    // Get membership for role check
    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', profile.organizationId).eq('userId', user._id),
      )
      .first()

    const isCreator = order.createdById === user._id
    const memberRole = membership?.role as MembershipRole | undefined
    const isOrgAdminOrOwner = memberRole === 'admin' || memberRole === 'owner'

    // 4. Validate transition is allowed
    const currentStatus = order.status as PaymentOrderStatus
    const newStatus = args.status as PaymentOrderStatus
    const allowedTransitions = VALID_TRANSITIONS[currentStatus]

    if (!allowedTransitions.includes(newStatus)) {
      throw new ConvexError({
        code: 'INVALID_INPUT',
        message: `Cannot transition from ${currentStatus} to ${newStatus}`,
      })
    }

    // 5. Validate user has permission for this transition
    const permissionChecker = TRANSITION_PERMISSIONS[currentStatus][newStatus]
    const canPerformTransition =
      permissionChecker?.({ isCreator, isOrgAdminOrOwner }) ?? false

    if (!canPerformTransition) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this status change',
      })
    }

    // 6. Validate required uploads on initial submission (CREATED → IN_REVIEW only)
    if (
      currentStatus === PaymentOrderStatus.CREATED &&
      newStatus === PaymentOrderStatus.IN_REVIEW
    ) {
      // Get tag to check fileRequirements
      if (order.tagId) {
        const tag = await ctx.db.get('tags', order.tagId)
        if (tag?.fileRequirements) {
          const requiredLabels = tag.fileRequirements
            .filter((r) => r.required)
            .map((r) => r.label)

          if (requiredLabels.length > 0) {
            // Get uploaded documents
            const documents = await ctx.db
              .query('paymentOrderDocuments')
              .withIndex('by_paymentOrder', (q) =>
                q.eq('paymentOrderId', args.id),
              )
              .collect()

            const uploadedLabels = new Set(
              documents.map((d) => d.requirementLabel),
            )
            const missingLabels = requiredLabels.filter(
              (label) => !uploadedLabels.has(label),
            )

            if (missingLabels.length > 0) {
              throw new ConvexError({
                code: 'INVALID_INPUT',
                message: `Missing required documents: ${missingLabels.join(', ')}`,
              })
            }
          }
        }
      }
    }

    // 7. Update order: status, updatedAt
    const now = Date.now()
    await ctx.db.patch('paymentOrders', args.id, {
      status: newStatus,
      updatedAt: now,
    })

    // 8. Create history entry
    await ctx.db.insert('paymentOrderHistory', {
      paymentOrderId: args.id,
      userId: user._id,
      action: HistoryAction.STATUS_CHANGED,
      previousStatus: currentStatus,
      newStatus: newStatus,
      comment: args.comment,
      createdAt: now,
    })

    // 9. Return updated order
    return await ctx.db.get('paymentOrders', args.id)
  },
})
