import { useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import { DotsThree } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  canSubmit?: boolean
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
  targetStatus: PaymentOrderStatus
  variant: 'default' | 'destructive' | 'outline' | 'secondary'
  requiresComment?: boolean
}

const ACTION_CONFIG: Record<ActionType, ActionConfig> = {
  submit: {
    targetStatus: 'IN_REVIEW',
    variant: 'default',
  },
  cancel: {
    targetStatus: 'CANCELLED',
    variant: 'destructive',
  },
  approve: {
    targetStatus: 'APPROVED',
    variant: 'default',
  },
  reject: {
    targetStatus: 'REJECTED',
    variant: 'destructive',
    requiresComment: true,
  },
  needsSupport: {
    targetStatus: 'NEEDS_SUPPORT',
    variant: 'secondary',
    requiresComment: true,
  },
  markPaid: {
    targetStatus: 'PAID',
    variant: 'default',
  },
  reconcile: {
    targetStatus: 'RECONCILED',
    variant: 'default',
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
        actions.push('approve', 'needsSupport', 'reject')
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
  canSubmit = true,
}: OrderActionsProps) {
  const { t } = useTranslation('orders')
  const { t: tc } = useTranslation('common')
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
      <div className="flex items-center gap-2">
        {/* Primary action as a visible button */}
        {(() => {
          const primary = availableActions[0]
          const config = ACTION_CONFIG[primary]
          const isSubmitAction = primary === 'submit'
          const isDisabled = isSubmitAction && !canSubmit
          return (
            <Button
              variant={config.variant}
              size="sm"
              onClick={() => handleAction(primary)}
              disabled={isDisabled}
              title={
                isDisabled ? t('actions.uploadRequiredTooltip') : undefined
              }
            >
              {t(`actions.${primary}.label`)}
            </Button>
          )
        })()}

        {/* Secondary actions in dropdown */}
        {availableActions.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="size-8 p-0" />
              }
            >
              <DotsThree weight="bold" className="size-4" />
              <span className="sr-only">{t('actions.moreActions')}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto">
              {availableActions.slice(1).map((action) => {
                const config = ACTION_CONFIG[action]
                return (
                  <DropdownMenuItem
                    key={action}
                    variant={
                      config.variant === 'destructive'
                        ? 'destructive'
                        : 'default'
                    }
                    onClick={() => handleAction(action)}
                  >
                    {t(`actions.${action}.label`)}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Simple confirmation dialog */}
      {activeConfig && !activeConfig.requiresComment && (
        <AlertDialog
          open={!!activeAction && !activeConfig.requiresComment}
          onOpenChange={(open) => !open && setActiveAction(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t(`actions.${activeAction}.confirmTitle`)}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t(`actions.${activeAction}.confirmDescription`)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tc('actions.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={executeAction}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending
                  ? tc('actions.processing')
                  : tc('actions.confirm')}
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
              <DialogTitle>
                {t(`actions.${activeAction}.confirmTitle`)}
              </DialogTitle>
              <DialogDescription>
                {t(`actions.${activeAction}.confirmDescription`)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="comment">{t('actions.comment')}</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('actions.commentPlaceholder')}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveAction(null)}>
                {tc('actions.cancel')}
              </Button>
              <Button
                onClick={executeAction}
                disabled={updateStatusMutation.isPending || !comment.trim()}
                variant={activeConfig.variant}
              >
                {updateStatusMutation.isPending
                  ? tc('actions.processing')
                  : tc('actions.confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
