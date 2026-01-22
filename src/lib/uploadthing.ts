import { UploadThingError, createUploadthing } from 'uploadthing/server'
import type { FileRouter } from 'uploadthing/server'

const f = createUploadthing()

// TODO: Replace with actual auth when WorkOS is integrated
const auth = (_req: Request): { id: string } | null => ({
  id: 'user-placeholder',
})

export const uploadRouter = {
  // General document uploader
  documentUploader: f({
    pdf: { maxFileSize: '16MB', maxFileCount: 10 },
    image: { maxFileSize: '4MB', maxFileCount: 10 },
  })
    .middleware(({ req }) => {
      const user = auth(req)
      if (!user) throw new UploadThingError('Unauthorized')
      return { userId: user.id }
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('File URL:', file.ufsUrl)
      return { uploadedBy: metadata.userId, url: file.ufsUrl }
    }),

  // Image-only uploader (for avatars, thumbnails, etc.)
  imageUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(({ req }) => {
      const user = auth(req)
      if (!user) throw new UploadThingError('Unauthorized')
      return { userId: user.id }
    })
    .onUploadComplete(({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl }
    }),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter
