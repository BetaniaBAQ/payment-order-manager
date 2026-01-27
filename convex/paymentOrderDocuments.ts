import { ConvexError, v } from 'convex/values'

import { UTApi } from 'uploadthing/server'

import { internal } from './_generated/api'
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from './_generated/server'
import { HistoryAction, PaymentOrderStatus } from './schema/status'
import type { MembershipRole } from './schema/organizationMemberships'

// Final statuses where documents cannot be deleted
const FINAL_STATUSES: Array<PaymentOrderStatus> = [
  'REJECTED',
  'RECONCILED',
  'CANCELLED',
]

export const create = mutation({
  args: {
    authKitId: v.string(),
    paymentOrderId: v.id('paymentOrders'),
    requirementLabel: v.string(),
    fileName: v.string(),
    fileKey: v.string(),
    fileUrl: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
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

    // Get order
    const order = await ctx.db.get('paymentOrders', args.paymentOrderId)
    if (!order) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Payment order not found',
      })
    }

    // Get profile for permission check
    const profile = await ctx.db.get('paymentOrderProfiles', order.profileId)
    if (!profile) {
      throw new ConvexError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }

    // Validate requirementLabel exists in tag's fileRequirements
    if (order.tagId) {
      const tag = await ctx.db.get('tags', order.tagId)
      if (tag?.fileRequirements) {
        const requirement = tag.fileRequirements.find(
          (r) => r.label === args.requirementLabel,
        )
        if (!requirement) {
          throw new ConvexError({
            code: 'INVALID_INPUT',
            message: `Invalid requirement label: ${args.requirementLabel}`,
          })
        }
        // Validate file type matches allowed MIME types
        if (!requirement.allowedMimeTypes.includes(args.fileType)) {
          throw new ConvexError({
            code: 'INVALID_INPUT',
            message: `File type ${args.fileType} not allowed for ${args.requirementLabel}`,
          })
        }
        // Validate file size if maxFileSizeMB is set
        if (requirement.maxFileSizeMB) {
          const maxBytes = requirement.maxFileSizeMB * 1024 * 1024
          if (args.fileSize > maxBytes) {
            throw new ConvexError({
              code: 'INVALID_INPUT',
              message: `File size exceeds ${requirement.maxFileSizeMB}MB limit`,
            })
          }
        }
      }
    }

    // Check permissions: creator or org admin/owner
    const isCreator = order.createdById === user._id

    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', profile.organizationId).eq('userId', user._id),
      )
      .first()

    const memberRole = membership?.role as MembershipRole | undefined
    const isOrgAdminOrOwner = memberRole === 'admin' || memberRole === 'owner'

    if (!isCreator && !isOrgAdminOrOwner) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Not authorized to upload documents to this order',
      })
    }

    // Delete existing document for this requirement (replace)
    const existingDoc = await ctx.db
      .query('paymentOrderDocuments')
      .withIndex('by_paymentOrder', (q) =>
        q.eq('paymentOrderId', args.paymentOrderId),
      )
      .filter((q) => q.eq(q.field('requirementLabel'), args.requirementLabel))
      .first()

    if (existingDoc) {
      await ctx.db.delete('paymentOrderDocuments', existingDoc._id)
    }

    const now = Date.now()

    // Insert document
    const documentId = await ctx.db.insert('paymentOrderDocuments', {
      paymentOrderId: args.paymentOrderId,
      uploadedById: user._id,
      requirementLabel: args.requirementLabel,
      fileName: args.fileName,
      fileKey: args.fileKey,
      fileUrl: args.fileUrl,
      fileType: args.fileType,
      fileSize: args.fileSize,
      createdAt: now,
    })

    // Create history entry
    await ctx.db.insert('paymentOrderHistory', {
      paymentOrderId: args.paymentOrderId,
      userId: user._id,
      action: HistoryAction.DOCUMENT_ADDED,
      comment: args.fileName,
      createdAt: now,
    })

    // If NEEDS_SUPPORT, auto-transition to IN_REVIEW
    if (order.status === PaymentOrderStatus.NEEDS_SUPPORT) {
      await ctx.db.patch('paymentOrders', args.paymentOrderId, {
        status: PaymentOrderStatus.IN_REVIEW,
        updatedAt: now,
      })

      // Record status change in history
      await ctx.db.insert('paymentOrderHistory', {
        paymentOrderId: args.paymentOrderId,
        userId: user._id,
        action: HistoryAction.STATUS_CHANGED,
        previousStatus: PaymentOrderStatus.NEEDS_SUPPORT,
        newStatus: PaymentOrderStatus.IN_REVIEW,
        comment: 'Auto-transitioned after document upload',
        createdAt: now,
      })
    }

    return documentId
  },
})

export const getByPaymentOrder = query({
  args: {
    paymentOrderId: v.id('paymentOrders'),
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

    // Get order
    const order = await ctx.db.get('paymentOrders', args.paymentOrderId)
    if (!order) {
      return []
    }

    // Get profile for access check
    const profile = await ctx.db.get('paymentOrderProfiles', order.profileId)
    if (!profile) {
      return []
    }

    // Check access
    const isProfileOwner = user._id === profile.ownerId
    const isCreator = order.createdById === user._id

    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', profile.organizationId).eq('userId', user._id),
      )
      .first()

    const isOrgMember = !!membership
    const userEmail = user.email.toLowerCase()
    const isWhitelisted = profile.allowedEmails.includes(userEmail)

    // Whitelisted users can only see documents for their own orders
    if (isWhitelisted && !isProfileOwner && !isOrgMember) {
      if (!isCreator) {
        return []
      }
    } else if (!isProfileOwner && !isOrgMember && !isWhitelisted) {
      return []
    }

    // Fetch documents
    const documents = await ctx.db
      .query('paymentOrderDocuments')
      .withIndex('by_paymentOrder', (q) =>
        q.eq('paymentOrderId', args.paymentOrderId),
      )
      .collect()

    // Enrich with uploader info
    const enrichedDocuments = await Promise.all(
      documents.map(async (doc) => {
        const uploader = await ctx.db.get('users', doc.uploadedById)
        return {
          ...doc,
          uploader: uploader
            ? {
                _id: uploader._id,
                name: uploader.name,
                email: uploader.email,
                avatarUrl: uploader.avatarUrl,
              }
            : null,
        }
      }),
    )

    // Sort by createdAt ascending (oldest first)
    return enrichedDocuments.sort((a, b) => a.createdAt - b.createdAt)
  },
})

// Internal query for action to validate access
export const _getDocumentWithAccess = internalQuery({
  args: {
    documentId: v.id('paymentOrderDocuments'),
    authKitId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db
      .query('users')
      .withIndex('by_authKitId', (q) => q.eq('authKitId', args.authKitId))
      .first()

    if (!user) {
      return { error: 'UNAUTHORIZED', message: 'User not found' }
    }

    // Get document
    const document = await ctx.db.get('paymentOrderDocuments', args.documentId)
    if (!document) {
      return { error: 'NOT_FOUND', message: 'Document not found' }
    }

    // Get order
    const order = await ctx.db.get('paymentOrders', document.paymentOrderId)
    if (!order) {
      return { error: 'NOT_FOUND', message: 'Payment order not found' }
    }

    // Check if order is in final status
    if (FINAL_STATUSES.includes(order.status as PaymentOrderStatus)) {
      return {
        error: 'FORBIDDEN',
        message: 'Cannot delete documents from orders in final status',
      }
    }

    // Get profile for permission check
    const profile = await ctx.db.get('paymentOrderProfiles', order.profileId)
    if (!profile) {
      return { error: 'NOT_FOUND', message: 'Profile not found' }
    }

    // Check permissions: uploader or org admin/owner
    const isUploader = document.uploadedById === user._id

    const membership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q) =>
        q.eq('organizationId', profile.organizationId).eq('userId', user._id),
      )
      .first()

    const memberRole = membership?.role as MembershipRole | undefined
    const isOrgAdminOrOwner = memberRole === 'admin' || memberRole === 'owner'

    if (!isUploader && !isOrgAdminOrOwner) {
      return {
        error: 'FORBIDDEN',
        message: 'Not authorized to delete this document',
      }
    }

    return {
      document,
      order,
      user,
    }
  },
})

// Internal mutation for action to delete document
export const _deleteDocument = internalMutation({
  args: {
    documentId: v.id('paymentOrderDocuments'),
    paymentOrderId: v.id('paymentOrders'),
    userId: v.id('users'),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Delete document
    await ctx.db.delete('paymentOrderDocuments', args.documentId)

    // Create history entry
    await ctx.db.insert('paymentOrderHistory', {
      paymentOrderId: args.paymentOrderId,
      userId: args.userId,
      action: HistoryAction.DOCUMENT_REMOVED,
      comment: args.fileName,
      createdAt: now,
    })
  },
})

// Action to delete document from both UploadThing and Convex (GDPR compliant)
export const remove = action({
  args: {
    documentId: v.id('paymentOrderDocuments'),
    authKitId: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate access and get document info
    const result = await ctx.runQuery(
      internal.paymentOrderDocuments._getDocumentWithAccess,
      {
        documentId: args.documentId,
        authKitId: args.authKitId,
      },
    )

    if ('error' in result) {
      throw new ConvexError({ code: result.error, message: result.message })
    }

    const { document, user } = result

    // Delete from UploadThing first (GDPR compliance - delete actual file)
    const utapi = new UTApi()
    try {
      await utapi.deleteFiles(document.fileKey)
    } catch (error) {
      // Log error but continue with Convex deletion
      // File may already be deleted or key may be invalid
      console.error('Failed to delete from UploadThing:', error)
    }

    // Delete from Convex
    await ctx.runMutation(internal.paymentOrderDocuments._deleteDocument, {
      documentId: args.documentId,
      paymentOrderId: document.paymentOrderId,
      userId: user._id,
      fileName: document.fileName,
    })

    return { success: true }
  },
})

// Check if all required uploads are complete for a payment order
export const checkRequiredUploads = query({
  args: {
    paymentOrderId: v.id('paymentOrders'),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get('paymentOrders', args.paymentOrderId)
    if (!order) {
      return { complete: false, missing: [], error: 'Order not found' }
    }

    // If no tag, no requirements to check
    if (!order.tagId) {
      return { complete: true, missing: [] }
    }

    const tag = await ctx.db.get('tags', order.tagId)
    if (!tag?.fileRequirements) {
      return { complete: true, missing: [] }
    }

    // Get required labels
    const requiredLabels = tag.fileRequirements
      .filter((r) => r.required)
      .map((r) => r.label)

    if (requiredLabels.length === 0) {
      return { complete: true, missing: [] }
    }

    // Get uploaded document labels
    const documents = await ctx.db
      .query('paymentOrderDocuments')
      .withIndex('by_paymentOrder', (q) =>
        q.eq('paymentOrderId', args.paymentOrderId),
      )
      .collect()

    const uploadedLabels = new Set(documents.map((d) => d.requirementLabel))

    // Find missing required labels
    const missing = requiredLabels.filter((label) => !uploadedLabels.has(label))

    return {
      complete: missing.length === 0,
      missing,
    }
  },
})
