import { getAuth } from '@workos/authkit-tanstack-react-start'

import { UploadThingError, createUploadthing } from 'uploadthing/server'
import type { FileRouter } from 'uploadthing/server'

const f = createUploadthing()

export const uploadRouter = {
  // General document uploader for payment orders
  documentUploader: f({
    pdf: { maxFileSize: '16MB', maxFileCount: 10 },
    image: { maxFileSize: '4MB', maxFileCount: 10 },
  })
    .middleware(async () => {
      const { user } = await getAuth()
      if (!user) throw new UploadThingError('Unauthorized')
      return { authKitId: user.id }
    })
    .onUploadComplete(({ metadata, file }) => {
      return {
        authKitId: metadata.authKitId,
        fileKey: file.key,
        fileUrl: file.ufsUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      }
    }),

  // Image-only uploader (for avatars, thumbnails, etc.)
  imageUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      const { user } = await getAuth()
      if (!user) throw new UploadThingError('Unauthorized')
      return { authKitId: user.id }
    })
    .onUploadComplete(({ metadata, file }) => {
      return {
        authKitId: metadata.authKitId,
        fileKey: file.key,
        fileUrl: file.ufsUrl,
      }
    }),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter
