import { useEffect, useState } from 'react'

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  Link,
  Outlet,
  createFileRoute,
  getRouteApi,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { getAuth } from '@workos/authkit-tanstack-react-start'
import { api } from 'convex/_generated/api'

import { PencilSimpleIcon } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { FunctionReturnType } from 'convex/server'
import type { Doc, Id } from 'convex/_generated/dataModel'

import { EmailWhitelistCard } from '@/components/profile-settings/email-whitelist-card'
import { AppHeader } from '@/components/shared/app-header'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useUser } from '@/hooks/use-user'
import { isOwnerOrAdmin } from '@/lib/auth'
import { HOME_BREADCRUMB, ROUTES } from '@/lib/constants'
import { convexQuery, useConvexMutation } from '@/lib/convex'
import { useForm } from '@/lib/form'
import { requiredString } from '@/lib/validators'

const authRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute(
  '/_authenticated/orgs/$slug/profiles/$profileSlug/_profile-settings',
)({
  loader: async ({ context, params }) => {
    const { user } = await getAuth()
    const authKitId = user?.id ?? ''

    const profile = await context.queryClient.ensureQueryData(
      convexQuery(api.paymentOrderProfiles.getBySlug, {
        orgSlug: params.slug,
        profileSlug: params.profileSlug,
      }),
    )

    if (!profile) {
      throw redirect({ to: ROUTES.org, params: { slug: params.slug } })
    }

    // Prefetch all data needed by the component to prevent Suspense blank screen
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.tags.getByProfile, {
          profileId: profile._id,
        }),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.organizationMemberships.getMemberRole, {
          organizationId: profile.organization._id,
          authKitId,
        }),
      ),
    ])

    return { profile }
  },
  component: ProfileSettingsLayout,
})

function ProfileSettingsLayout() {
  const { authKitId } = authRoute.useLoaderData()
  const { slug, profileSlug } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('settings')
  const { t: tc } = useTranslation('common')

  const { data: profile } = useSuspenseQuery(
    convexQuery(api.paymentOrderProfiles.getBySlug, {
      orgSlug: slug,
      profileSlug,
    }),
  )

  const { data: tags } = useSuspenseQuery(
    convexQuery(api.tags.getByProfile, {
      profileId: profile?._id ?? ('' as Id<'paymentOrderProfiles'>),
    }),
  )

  const currentUser = useUser()

  const { data: memberRole } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getMemberRole, {
      organizationId: profile?.organization._id ?? ('' as Id<'organizations'>),
      authKitId,
    }),
  )

  // Check authorization: must be profile owner OR org admin/owner
  const isProfileOwner = currentUser?._id === profile?.owner?._id
  const isOrgAdminOrOwner = isOwnerOrAdmin(memberRole)
  const canManageProfile = isProfileOwner || isOrgAdminOrOwner

  // Redirect unauthorized users back to org page
  useEffect(() => {
    if (profile && !canManageProfile) {
      navigate({ to: ROUTES.org, params: { slug } })
    }
  }, [profile, canManageProfile, navigate, slug])

  if (!profile || !canManageProfile) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        breadcrumbs={[
          HOME_BREADCRUMB,
          {
            label: profile.organization.name,
            to: ROUTES.org,
            params: { slug },
          },
          {
            label: profile.name,
            to: ROUTES.profile,
            params: { slug, profileSlug },
          },
          { label: tc('breadcrumbs.settings') },
        ]}
      />

      <main id="main-content" className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">
              {t('profile.settingsDescription')}
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  nativeButton={false}
                  render={
                    <Link
                      to="/orgs/$slug/profiles/$profileSlug/details"
                      params={{ slug, profileSlug }}
                    >
                      <PencilSimpleIcon className="size-5" />
                    </Link>
                  }
                />
              }
            />
            <TooltipContent>
              <p>{t('profile.editProfile')}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-6">
          <Outlet />
          <EmailWhitelistCard profile={profile} authKitId={authKitId} />
          <TagsCard profile={profile} tags={tags} authKitId={authKitId} />
          <UploadFieldsCard tags={tags} authKitId={authKitId} />
        </div>
      </main>
    </div>
  )
}

type Tag = Doc<'tags'>

type ProfileData = NonNullable<
  FunctionReturnType<typeof api.paymentOrderProfiles.getBySlug>
>

function TagsCard({
  profile,
  tags,
  authKitId,
}: {
  profile: ProfileData
  tags: Array<Tag>
  authKitId: string
}) {
  const { t } = useTranslation('settings')
  const { t: tc } = useTranslation('common')
  const [createOpen, setCreateOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: useConvexMutation(api.tags.delete_),
    onSuccess: () => {
      toast.success(t('toast.tagDeleted'))
      queryClient.invalidateQueries()
    },
    onError: (error) => {
      toast.error(error.message || t('toast.tagDeletedError'))
    },
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('tags.title')}</CardTitle>
          <CardDescription>{t('tags.description')}</CardDescription>
        </div>
        <TagDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          profileId={profile._id}
          authKitId={authKitId}
        />
      </CardHeader>
      <CardContent>
        {tags.length > 0 ? (
          <div className="divide-y">
            {tags.map((tag) => (
              <div
                key={tag._id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <div>
                    <p className="font-medium">{tag.name}</p>
                    {tag.description && (
                      <p className="text-muted-foreground text-sm">
                        {tag.description}
                      </p>
                    )}
                    {tag.fileRequirements &&
                      tag.fileRequirements.length > 0 && (
                        <p className="text-muted-foreground text-xs">
                          {tag.fileRequirements.length}{' '}
                          {t('tags.fileRequirements')}
                        </p>
                      )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTag(tag)}
                  >
                    {tc('actions.edit')}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button variant="ghost" size="sm">
                          {tc('actions.delete')}
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t('tags.deleteTitle')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('tags.deleteDescription')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {tc('actions.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            deleteMutation.mutate({ authKitId, id: tag._id })
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {tc('actions.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{t('tags.noTags')}</p>
            <p className="text-muted-foreground text-sm">
              {t('tags.noTagsDescription')}
            </p>
          </div>
        )}
      </CardContent>

      {editingTag && (
        <TagDialog
          open={!!editingTag}
          onOpenChange={(open) => !open && setEditingTag(null)}
          profileId={profile._id}
          authKitId={authKitId}
          tag={editingTag}
        />
      )}
    </Card>
  )
}

const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
] as const

const DEFAULT_TAG_COLOR = TAG_COLORS[0]

function TagDialog({
  open,
  onOpenChange,
  profileId,
  authKitId,
  tag,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileId: Id<'paymentOrderProfiles'>
  authKitId: string
  tag?: Tag
}) {
  const { t } = useTranslation('settings')
  const { t: tc } = useTranslation('common')
  const queryClient = useQueryClient()
  const isEditing = !!tag

  const createMutation = useMutation({
    mutationFn: useConvexMutation(api.tags.create),
    onSuccess: () => {
      toast.success(t('toast.tagCreated'))
      queryClient.invalidateQueries()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || t('toast.tagCreatedError'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: useConvexMutation(api.tags.update),
    onSuccess: () => {
      toast.success(t('toast.tagUpdated'))
      queryClient.invalidateQueries()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || t('toast.tagUpdatedError'))
    },
  })

  const form = useForm({
    defaultValues: {
      name: tag?.name ?? '',
      color: tag?.color ?? DEFAULT_TAG_COLOR,
      description: tag?.description ?? '',
    },
    onSubmit: async ({ value }) => {
      if (isEditing) {
        await updateMutation.mutateAsync({
          authKitId,
          id: tag._id,
          name: value.name,
          color: value.color,
          description: value.description || undefined,
        })
      } else {
        await createMutation.mutateAsync({
          authKitId,
          profileId,
          name: value.name,
          color: value.color,
          description: value.description || undefined,
        })
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isEditing && (
        <DialogTrigger render={<Button>{t('tags.newButton')}</Button>} />
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('tags.editTitle') : t('tags.createTitle')}
          </DialogTitle>
          <DialogDescription>{t('tags.dialogDescription')}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field name="name" validators={{ onChange: requiredString }}>
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('tags.nameField')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={t('tags.namePlaceholder')}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field name="color">
            {(field) => (
              <Field>
                <FieldLabel>{t('tags.colorField')}</FieldLabel>
                <FieldContent>
                  <div className="flex gap-2">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-8 w-8 rounded-full transition-all ${
                          field.state.value === color
                            ? 'ring-primary ring-2 ring-offset-2'
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => field.handleChange(color)}
                      />
                    ))}
                  </div>
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('tags.descriptionField')}
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={t('tags.descriptionPlaceholder')}
                    rows={2}
                  />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tc('actions.cancel')}
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting
                    ? tc('actions.saving')
                    : isEditing
                      ? tc('actions.saveChanges')
                      : t('tags.createTitle')}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// File type options for upload fields
const FILE_TYPE_OPTIONS = [
  { value: 'application/pdf', label: 'PDF' },
  { value: 'image/*', label: 'Images' },
  {
    value:
      'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    label: 'Excel',
  },
  {
    value:
      'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    label: 'Word',
  },
  { value: 'text/csv', label: 'CSV' },
] as const

type FileRequirement = NonNullable<Doc<'tags'>['fileRequirements']>[number]

type UploadFieldWithTag = FileRequirement & {
  tagId: Id<'tags'>
  tagName: string
  tagColor: string
  index: number
}

function UploadFieldsCard({
  tags,
  authKitId,
}: {
  tags: Array<Tag>
  authKitId: string
}) {
  const { t } = useTranslation('settings')
  const { t: tc } = useTranslation('common')
  const [selectedTab, setSelectedTab] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [editingField, setEditingField] = useState<UploadFieldWithTag | null>(
    null,
  )
  const queryClient = useQueryClient()

  // Flatten all upload fields from all tags
  const allUploadFields: Array<UploadFieldWithTag> = tags.flatMap((tag) =>
    (tag.fileRequirements ?? []).map((field, index) => ({
      ...field,
      tagId: tag._id,
      tagName: tag.name,
      tagColor: tag.color,
      index,
    })),
  )

  // Filter by selected tab
  const filteredFields =
    selectedTab === 'all'
      ? allUploadFields
      : allUploadFields.filter((field) => field.tagId === selectedTab)

  const removeMutation = useMutation({
    mutationFn: useConvexMutation(api.tags.removeUploadField),
    onSuccess: () => {
      toast.success(t('toast.uploadFieldDeleted'))
      queryClient.invalidateQueries()
    },
    onError: (error) => {
      toast.error(error.message || t('toast.uploadFieldDeletedError'))
    },
  })

  // Get the tag for the currently selected tab (for pre-selecting in dialog)
  const selectedTagId =
    selectedTab !== 'all' ? (selectedTab as Id<'tags'>) : undefined

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('uploadFields.title')}</CardTitle>
          <CardDescription>{t('uploadFields.description')}</CardDescription>
        </div>
        <UploadFieldDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          tags={tags}
          authKitId={authKitId}
          preselectedTagId={selectedTagId}
        />
      </CardHeader>
      <CardContent>
        {tags.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{t('tags.noTags')}</p>
            <p className="text-muted-foreground text-sm">
              {t('uploadFields.noTagsFirst')}
            </p>
          </div>
        ) : (
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">{t('uploadFields.all')}</TabsTrigger>
              {tags.map((tag) => (
                <TabsTrigger
                  key={tag._id}
                  value={tag._id}
                  style={{ color: tag.color }}
                >
                  {tag.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedTab}>
              {filteredFields.length > 0 ? (
                <div className="divide-y">
                  {filteredFields.map((field) => (
                    <div
                      key={`${field.tagId}-${field.index}`}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{field.label}</p>
                          {field.required && (
                            <Badge variant="secondary" className="text-xs">
                              {tc('required')}
                            </Badge>
                          )}
                          {selectedTab === 'all' && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: field.tagColor,
                                color: field.tagColor,
                              }}
                            >
                              {field.tagName}
                            </Badge>
                          )}
                        </div>
                        {field.description && (
                          <p className="text-muted-foreground text-sm">
                            {field.description}
                          </p>
                        )}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {field.allowedMimeTypes.map((mime) => {
                            const option = FILE_TYPE_OPTIONS.find((opt) => {
                              const firstValue = opt.value.split(',')[0] ?? ''
                              return (
                                opt.value.includes(mime) ||
                                mime.includes(firstValue)
                              )
                            })
                            return (
                              <Badge
                                key={mime}
                                variant="secondary"
                                className="text-xs"
                              >
                                {option?.label ?? mime}
                              </Badge>
                            )
                          })}
                          {field.maxFileSizeMB && (
                            <Badge variant="secondary" className="text-xs">
                              {t('uploadFields.maxSize', {
                                size: field.maxFileSizeMB,
                              })}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingField(field)}
                        >
                          {tc('actions.edit')}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button variant="ghost" size="sm">
                                {tc('actions.delete')}
                              </Button>
                            }
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t('uploadFields.deleteTitle')}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('uploadFields.deleteDescription')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {tc('actions.cancel')}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  removeMutation.mutate({
                                    authKitId,
                                    tagId: field.tagId,
                                    index: field.index,
                                  })
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {tc('actions.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {t('uploadFields.noFields')}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t('uploadFields.noFieldsDescription')}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      {editingField && (
        <UploadFieldDialog
          open={!!editingField}
          onOpenChange={(open) => !open && setEditingField(null)}
          tags={tags}
          authKitId={authKitId}
          field={editingField}
        />
      )}
    </Card>
  )
}

function UploadFieldDialog({
  open,
  onOpenChange,
  tags,
  authKitId,
  field,
  preselectedTagId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tags: Array<Tag>
  authKitId: string
  field?: UploadFieldWithTag
  preselectedTagId?: Id<'tags'>
}) {
  const { t } = useTranslation('settings')
  const { t: tc } = useTranslation('common')
  const queryClient = useQueryClient()
  const isEditing = !!field

  const addMutation = useMutation({
    mutationFn: useConvexMutation(api.tags.addUploadField),
    onSuccess: () => {
      toast.success(t('toast.uploadFieldCreated'))
      queryClient.invalidateQueries()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || t('toast.uploadFieldCreatedError'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: useConvexMutation(api.tags.updateUploadField),
    onSuccess: () => {
      toast.success(t('toast.uploadFieldUpdated'))
      queryClient.invalidateQueries()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || t('toast.uploadFieldUpdatedError'))
    },
  })

  const form = useForm({
    defaultValues: {
      tagId: field?.tagId ?? preselectedTagId ?? ('' as Id<'tags'> | ''),
      label: field?.label ?? '',
      description: field?.description ?? '',
      allowedMimeTypes: field?.allowedMimeTypes ?? ['application/pdf'],
      maxFileSizeMB: field?.maxFileSizeMB?.toString() ?? '',
      required: field?.required ?? true,
    },
    onSubmit: async ({ value }) => {
      const uploadField = {
        label: value.label,
        description: value.description || undefined,
        allowedMimeTypes: value.allowedMimeTypes,
        maxFileSizeMB: value.maxFileSizeMB
          ? Number(value.maxFileSizeMB)
          : undefined,
        required: value.required,
      }

      if (field) {
        await updateMutation.mutateAsync({
          authKitId,
          tagId: field.tagId,
          index: field.index,
          uploadField,
        })
      } else {
        if (!value.tagId) {
          toast.error(t('toast.selectTagError'))
          return
        }
        await addMutation.mutateAsync({
          authKitId,
          tagId: value.tagId,
          uploadField,
        })
      }
    },
  })

  // Helper to check if a mime type is selected
  const isMimeTypeSelected = (mimeType: string) => {
    const currentTypes = form.getFieldValue('allowedMimeTypes')
    const mimeValues = mimeType.split(',')
    return mimeValues.some((m) => currentTypes.includes(m))
  }

  // Helper to toggle a mime type
  const toggleMimeType = (mimeType: string) => {
    const currentTypes = form.getFieldValue('allowedMimeTypes')
    const mimeValues = mimeType.split(',')
    const isSelected = mimeValues.some((m) => currentTypes.includes(m))

    if (isSelected) {
      // Remove all mime values from this option
      const newTypes = currentTypes.filter(
        (t: string) => !mimeValues.includes(t),
      )
      form.setFieldValue(
        'allowedMimeTypes',
        newTypes.length > 0 ? newTypes : ['application/pdf'],
      )
    } else {
      // Add all mime values from this option
      const newTypes = [...currentTypes, ...mimeValues]
      form.setFieldValue('allowedMimeTypes', [...new Set(newTypes)])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isEditing && (
        <DialogTrigger
          render={<Button>{t('uploadFields.newButton')}</Button>}
        />
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t('uploadFields.editTitle')
              : t('uploadFields.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('uploadFields.dialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          {!isEditing && !preselectedTagId && (
            <form.Field name="tagId">
              {(fieldApi) => {
                const selectedTag = tags.find(
                  (t) => t._id === fieldApi.state.value,
                )
                return (
                  <Field>
                    <FieldLabel>{t('uploadFields.tagField')}</FieldLabel>
                    <FieldContent>
                      <Select
                        value={fieldApi.state.value || null}
                        onValueChange={(val) =>
                          fieldApi.handleChange(val ?? '')
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t('uploadFields.tagPlaceholder')}
                          >
                            {selectedTag && (
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: selectedTag.color }}
                                />
                                {selectedTag.name}
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {tags.map((tag) => (
                            <SelectItem key={tag._id} value={tag._id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: tag.color }}
                                />
                                {tag.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={fieldApi.state.meta.errors} />
                    </FieldContent>
                  </Field>
                )
              }}
            </form.Field>
          )}

          <form.Field name="label" validators={{ onChange: requiredString }}>
            {(fieldApi) => (
              <Field>
                <FieldLabel htmlFor={fieldApi.name}>
                  {t('uploadFields.labelField')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id={fieldApi.name}
                    value={fieldApi.state.value}
                    onBlur={fieldApi.handleBlur}
                    onChange={(e) => fieldApi.handleChange(e.target.value)}
                    placeholder={t('uploadFields.labelPlaceholder')}
                  />
                  <FieldError errors={fieldApi.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field name="description">
            {(fieldApi) => (
              <Field>
                <FieldLabel htmlFor={fieldApi.name}>
                  {t('uploadFields.descriptionField')}
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id={fieldApi.name}
                    value={fieldApi.state.value}
                    onBlur={fieldApi.handleBlur}
                    onChange={(e) => fieldApi.handleChange(e.target.value)}
                    placeholder={t('uploadFields.descriptionPlaceholder')}
                    rows={2}
                  />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field name="allowedMimeTypes">
            {() => (
              <Field>
                <FieldLabel>{t('uploadFields.fileTypesField')}</FieldLabel>
                <FieldContent>
                  <div className="flex flex-wrap gap-3">
                    {FILE_TYPE_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Checkbox
                          checked={isMimeTypeSelected(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked !== isMimeTypeSelected(option.value)) {
                              toggleMimeType(option.value)
                            }
                          }}
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field name="maxFileSizeMB">
            {(fieldApi) => (
              <Field>
                <FieldLabel htmlFor={fieldApi.name}>
                  {t('uploadFields.maxSizeField')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id={fieldApi.name}
                    type="number"
                    min="1"
                    max="100"
                    value={fieldApi.state.value}
                    onBlur={fieldApi.handleBlur}
                    onChange={(e) => fieldApi.handleChange(e.target.value)}
                    placeholder="10"
                  />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field name="required">
            {(fieldApi) => (
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor={fieldApi.name}>
                    {t('uploadFields.requiredField')}
                  </FieldLabel>
                  <Switch
                    id={fieldApi.name}
                    checked={fieldApi.state.value}
                    onCheckedChange={(checked) =>
                      fieldApi.handleChange(checked)
                    }
                  />
                </div>
              </Field>
            )}
          </form.Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tc('actions.cancel')}
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting
                    ? tc('actions.saving')
                    : isEditing
                      ? tc('actions.saveChanges')
                      : t('uploadFields.createTitle')}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
