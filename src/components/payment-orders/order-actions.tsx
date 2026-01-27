import { useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import type { PaymentOrderStatus } from 'convex/schema'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useConvexMutation } from '@/lib/convex'

interface OrderActionsProps {
  order: {
    _id: Id<'paymentOrders'>
    status: PaymentOrderStatus
    createdById: Id<'users'>
  }
  isCreator: boolean
  isOrgAdminOrOwner: boolean
  authKitId: string
}

type ActionType =
  | 'submit'
  | 'cancel'
  | 'approve'
  | 'reject'
  | 'needsSupport'
  | 'markPaid'
  | 'reconcile'

interface ActionConfig {
  label: string
  targetStatus: PaymentOrderStatus
  variant: 'default' | 'destructive' | 'outline' | 'secondary'
  requiresComment?: boolean
  confirmTitle?: string
  confirmDescription?: string
}

const ACTION_CONFIG: Record<ActionType, ActionConfig> = {
  submit: {
    label: 'Submit for Review',
    targetStatus: 'IN_REVIEW',
    variant: 'default',
    confirmTitle: 'Submit for Review?',
    confirmDescription:
      "This order will be sent to reviewers for approval. You can still cancel it while it's in review.",
  },
  cancel: {
    label: 'Cancel',
    targetStatus: 'CANCELLED',
    variant: 'destructive',
    confirmTitle: 'Cancel Order?',
    confirmDescription:
      'This action cannot be undone. The order will be permanently cancelled.',
  },
  approve: {
    label: 'Approve',
    targetStatus: 'APPROVED',
    variant: 'default',
    confirmTitle: 'Approve Order?',
    confirmDescription: 'This order will be approved and ready for payment.',
  },
  reject: {
    label: 'Reject',
    targetStatus: 'REJECTED',
    variant: 'destructive',
    requiresComment: true,
    confirmTitle: 'Reject Order?',
    confirmDescription: 'Please provide a reason for rejection.',
  },
  needsSupport: {
    label: 'Request Documents',
    targetStatus: 'NEEDS_SUPPORT',
    variant: 'secondary',
    requiresComment: true,
    confirmTitle: 'Request Additional Documents?',
    confirmDescription:
      'Please describe what documents or information you need from the requester.',
  },
  markPaid: {
    label: 'Mark as Paid',
    targetStatus: 'PAID',
    variant: 'default',
    confirmTitle: 'Mark as Paid?',
    confirmDescription: 'Confirm that this payment has been processed.',
  },
  reconcile: {
    label: 'Reconcile',
    targetStatus: 'RECONCILED',
    variant: 'default',
    confirmTitle: 'Mark as Reconciled?',
    confirmDescription:
      'Confirm that this payment has been reconciled with accounting records.',
  },
}

function getAvailableActions(
  status: PaymentOrderStatus,
  isCreator: boolean,
  isOrgAdminOrOwner: boolean,
): Array<ActionType> {
  const actions: Array<ActionType> = []

  switch (status) {
    case 'CREATED':
      if (isCreator) {
        actions.push('submit', 'cancel')
      }
      break
    case 'IN_REVIEW':
      if (isOrgAdminOrOwner) {
        actions.push('approve', 'reject', 'needsSupport')
      }
      if (isCreator || isOrgAdminOrOwner) {
        actions.push('cancel')
      }
      break
    case 'NEEDS_SUPPORT':
      if (isCreator) {
        actions.push('submit')
      }
      if (isCreator || isOrgAdminOrOwner) {
        actions.push('cancel')
      }
      break
    case 'APPROVED':
      if (isOrgAdminOrOwner) {
        actions.push('markPaid')
      }
      break
    case 'PAID':
      if (isOrgAdminOrOwner) {
        actions.push('reconcile')
      }
      break
  }

  return actions
}

export function OrderActions({
  order,
  isCreator,
  isOrgAdminOrOwner,
  authKitId,
}: OrderActionsProps) {
  const router = useRouter()
  const [activeAction, setActiveAction] = useState<ActionType | null>(null)
  const [comment, setComment] = useState('')

  const updateStatusMutation = useMutation({
    mutationFn: useConvexMutation(api.paymentOrders.updateStatus),
    onSuccess: () => {
      setActiveAction(null)
      setComment('')
      router.invalidate()
    },
  })

  const availableActions = getAvailableActions(
    order.status,
    isCreator,
    isOrgAdminOrOwner,
  )

  if (availableActions.length === 0) {
    return null
  }

  const handleAction = (action: ActionType) => {
    setActiveAction(action)
    setComment('')
  }

  const executeAction = () => {
    if (!activeAction) return

    const config = ACTION_CONFIG[activeAction]
    updateStatusMutation.mutate({
      authKitId,
      id: order._id,
      status: config.targetStatus,
      comment: comment || undefined,
    })
  }

  const activeConfig = activeAction ? ACTION_CONFIG[activeAction] : null

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {availableActions.map((action) => {
          const config = ACTION_CONFIG[action]
          return (
            <Button
              key={action}
              variant={config.variant}
              size="sm"
              onClick={() => handleAction(action)}
            >
              {config.label}
            </Button>
          )
        })}
      </div>

      {/* Simple confirmation dialog */}
      {activeConfig && !activeConfig.requiresComment && (
        <AlertDialog
          open={!!activeAction && !activeConfig.requiresComment}
          onOpenChange={(open) => !open && setActiveAction(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{activeConfig.confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {activeConfig.confirmDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={executeAction}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? 'Processing...' : 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Dialog with comment input */}
      {activeConfig?.requiresComment && (
        <Dialog
          open={!!activeAction && activeConfig.requiresComment}
          onOpenChange={(open) => !open && setActiveAction(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{activeConfig.confirmTitle}</DialogTitle>
              <DialogDescription>
                {activeConfig.confirmDescription}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your reason or instructions..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveAction(null)}>
                Cancel
              </Button>
              <Button
                onClick={executeAction}
                disabled={updateStatusMutation.isPending || !comment.trim()}
                variant={activeConfig.variant}
              >
                {updateStatusMutation.isPending ? 'Processing...' : 'Confirm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
