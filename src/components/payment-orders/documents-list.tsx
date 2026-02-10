import { useState } from 'react'

import { useMutation } from '@tanstack/react-query'

import { api } from 'convex/_generated/api'
import { useConvexAction } from '@convex-dev/react-query'

import {
  ArrowSquareOutIcon,
  FileIcon,
  FilePdfIcon,
  ImageIcon,
  SpinnerIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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
import { Button } from '@/components/ui/button'
import { formatDateTime, formatFileSize, useLocale } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Document {
  _id: Id<'paymentOrderDocuments'>
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  createdAt: number
  uploader: {
    _id: Id<'users'>
    name: string
    email: string
    avatarUrl?: string
  } | null
}

interface DocumentsListProps {
  documents: Array<Document>
  canDelete: boolean
  authKitId: string
  className?: string
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) {
    return ImageIcon
  }
  if (fileType === 'application/pdf') {
    return FilePdfIcon
  }
  return FileIcon
}

export function DocumentsList({
  documents,
  canDelete,
  authKitId,
  className,
}: DocumentsListProps) {
  const { t } = useTranslation('orders')
  const { t: tc } = useTranslation('common')
  const locale = useLocale()
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null)

  const { mutate: removeDocument, isPending: isDeleting } = useMutation({
    mutationFn: useConvexAction(api.paymentOrderDocuments.remove),
    onSuccess: () => {
      toast.success(t('toast.documentDeleted'))
      setDeleteTarget(null)
    },
    onError: (error) => {
      console.error('Failed to delete document:', error)
      toast.error(t('toast.documentDeletedError'))
    },
  })

  if (documents.length === 0) {
    return (
      <div className={cn('text-muted-foreground py-8 text-center', className)}>
        <FileIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p>{t('documents.noDocuments')}</p>
      </div>
    )
  }

  return (
    <>
      <div className={cn('space-y-2', className)}>
        {documents.map((doc) => {
          const Icon = getFileIcon(doc.fileType)
          return (
            <div
              key={doc._id}
              className="bg-muted/50 flex items-center gap-3 rounded-lg p-3"
            >
              <Icon className="text-muted-foreground h-8 w-8 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{doc.fileName}</p>
                <p className="text-muted-foreground text-sm">
                  {formatFileSize(doc.fileSize, locale)} &middot;{' '}
                  {doc.uploader?.name ?? t('timeline.unknownUser')} &middot;{' '}
                  {formatDateTime(doc.createdAt, locale)}
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
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ArrowSquareOutIcon className="h-4 w-4" />
                      <span className="sr-only">
                        {t('documents.openDocument')}
                      </span>
                    </a>
                  )}
                />
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => setDeleteTarget(doc)}
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span className="sr-only">
                      {t('documents.deleteDocument')}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('documents.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('documents.deleteDescription', {
                filename: deleteTarget?.fileName,
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
                if (deleteTarget) {
                  removeDocument({
                    documentId: deleteTarget._id,
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
    </>
  )
}
