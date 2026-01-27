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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export function DocumentsList({
  documents,
  canDelete,
  authKitId,
  className,
}: DocumentsListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null)

  const { mutate: removeDocument, isPending: isDeleting } = useMutation({
    mutationFn: useConvexAction(api.paymentOrderDocuments.remove),
    onSuccess: () => {
      toast.success('Document deleted')
      setDeleteTarget(null)
    },
    onError: (error) => {
      console.error('Failed to delete document:', error)
      toast.error('Failed to delete document')
    },
  })

  if (documents.length === 0) {
    return (
      <div className={cn('text-muted-foreground py-8 text-center', className)}>
        <FileIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p>No documents attached</p>
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
                  {formatFileSize(doc.fileSize)} &middot;{' '}
                  {doc.uploader?.name ?? 'Unknown'} &middot;{' '}
                  {formatDate(doc.createdAt)}
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
                      <span className="sr-only">Open document</span>
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
                    <span className="sr-only">Delete document</span>
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
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.fileName}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
