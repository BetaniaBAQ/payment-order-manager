import { useMutation } from '@tanstack/react-query'

import { api } from 'convex/_generated/api'
import { useConvexMutation } from '@convex-dev/react-query'

import { toast } from 'sonner'
import type { Id } from 'convex/_generated/dataModel'

import { UploadDropzone } from '@/lib/uploadthing-client'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  paymentOrderId: Id<'paymentOrders'>
  authKitId: string
  requirementLabel: string
  onUploadComplete?: () => void
  disabled?: boolean
  className?: string
}

export function FileUploader({
  paymentOrderId,
  authKitId,
  requirementLabel,
  onUploadComplete,
  disabled,
  className,
}: FileUploaderProps) {
  const { mutateAsync: createDocument } = useMutation({
    mutationFn: useConvexMutation(api.paymentOrderDocuments.create),
  })

  return (
    <UploadDropzone
      endpoint="documentUploader"
      disabled={disabled}
      config={{ mode: 'auto' }}
      className={cn(
        'ut-button:bg-primary ut-button:ut-readying:bg-primary/50',
        'ut-label:text-foreground ut-allowed-content:text-muted-foreground',
        'border-border ut-uploading:cursor-not-allowed',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      onClientUploadComplete={async (files) => {
        // Create document records in Convex for each uploaded file
        try {
          // Only create one document (single file per requirement)
          const file = files[0]
          if (file) {
            await createDocument({
              authKitId,
              paymentOrderId,
              requirementLabel,
              fileName: file.name,
              fileKey: file.key,
              fileUrl: file.ufsUrl,
              fileType: file.type,
              fileSize: file.size,
            })
            toast.success('Document uploaded successfully')
          }
          onUploadComplete?.()
        } catch (error) {
          console.error('Failed to create document record:', error)
          toast.error('Failed to save document. Please try again.')
        }
      }}
      onUploadError={(error) => {
        console.error('Upload error:', error)
        toast.error(error.message || 'Upload failed. Please try again.')
      }}
    />
  )
}
