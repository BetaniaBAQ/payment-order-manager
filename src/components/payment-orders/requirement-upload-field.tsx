import { useState } from 'react'

import { useMutation } from '@tanstack/react-query'

import { api } from 'convex/_generated/api'
import { useConvexAction } from '@convex-dev/react-query'
import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  FileIcon,
  FilePdfIcon,
  ImageIcon,
  SpinnerIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FileUploader } from './file-uploader'
import type { Id } from 'convex/_generated/dataModel'


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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatFileSize, useLocale } from '@/lib/format'
import { cn } from '@/lib/utils'


interface FileRequirement {
  label: string
  description?: string
  allowedMimeTypes: Array<string>
  maxFileSizeMB?: number
  required: boolean
}

interface Document {
  _id: Id<'paymentOrderDocuments'>
  requirementLabel: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  createdAt: number
}

interface RequirementUploadFieldProps {
  requirement: FileRequirement
  document?: Document
  paymentOrderId: Id<'paymentOrders'>
  authKitId: string
  canDelete: boolean
  disabled?: boolean
  className?: string
}

function formatAllowedTypes(mimeTypes: Array<string>): string {
  const typeMap: Record<string, string> = {
    'application/pdf': 'PDF',
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'image/gif': 'GIF',
    'image/webp': 'WebP',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'DOCX',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  }

  return mimeTypes.map((type) => typeMap[type] ?? type.split('/')[1]).join(', ')
}

export function RequirementUploadField({
  requirement,
  document,
  paymentOrderId,
  authKitId,
  canDelete,
  disabled,
  className,
}: RequirementUploadFieldProps) {
  const { t } = useTranslation('orders')
  const { t: tc } = useTranslation('common')
  const locale = useLocale()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { mutate: removeDocument, isPending: isDeleting } = useMutation({
    mutationFn: useConvexAction(api.paymentOrderDocuments.remove),
    onSuccess: () => {
      toast.success(t('toast.documentDeleted'))
      setShowDeleteDialog(false)
    },
    onError: (error) => {
      console.error('Failed to delete document:', error)
      toast.error(t('toast.documentDeletedError'))
    },
  })

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{requirement.label}</Label>
        {requirement.required ? (
          <Badge variant="destructive" className="text-xs">
            {t('documents.required')}
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            {t('documents.optional')}
          </Badge>
        )}
        {document && (
          <CheckCircleIcon className="h-4 w-4 text-green-500" weight="fill" />
        )}
      </div>

      {requirement.description && (
        <p className="text-muted-foreground text-sm">
          {requirement.description}
        </p>
      )}

      {document ? (
        <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
          {document.fileType.startsWith('image/') ? (
            <ImageIcon className="text-muted-foreground h-8 w-8 shrink-0" />
          ) : document.fileType === 'application/pdf' ? (
            <FilePdfIcon className="text-muted-foreground h-8 w-8 shrink-0" />
          ) : (
            <FileIcon className="text-muted-foreground h-8 w-8 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{document.fileName}</p>
            <p className="text-muted-foreground text-sm">
              {formatFileSize(document.fileSize, locale)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              render={(props) => (
                <a
                  {...props}
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ArrowSquareOutIcon className="h-4 w-4" />
                  <span className="sr-only">{t('documents.openDocument')}</span>
                </a>
              )}
            />
            {canDelete && !disabled && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive h-8 w-8"
                onClick={() => setShowDeleteDialog(true)}
              >
                <TrashIcon className="h-4 w-4" />
                <span className="sr-only">{t('documents.deleteDocument')}</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <FileUploader
            paymentOrderId={paymentOrderId}
            authKitId={authKitId}
            requirementLabel={requirement.label}
            disabled={disabled}
          />
          <p className="text-muted-foreground text-xs">
            {t('documents.allowedTypes', {
              types: formatAllowedTypes(requirement.allowedMimeTypes),
              size: requirement.maxFileSizeMB,
            })}
          </p>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('documents.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('documents.deleteDescription', {
                filename: document?.fileName,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {tc('actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => {
                if (document) {
                  removeDocument({
                    documentId: document._id,
                    authKitId,
                  })
                }
              }}
            >
              {isDeleting ? (
                <>
                  <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                  {tc('actions.deleting')}
                </>
              ) : (
                tc('actions.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
