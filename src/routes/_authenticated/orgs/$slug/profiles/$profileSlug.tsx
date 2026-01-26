import { useState } from 'react'

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  createFileRoute,
  getRouteApi,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import type { Doc, Id } from 'convex/_generated/dataModel'


import { AppHeader } from '@/components/app-header'
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { convexQuery, useConvexMutation } from '@/lib/convex'
import { useForm } from '@/lib/form'
import { requiredString } from '@/lib/validators'

const authRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute(
  '/_authenticated/orgs/$slug/profiles/$profileSlug',
)({
  loader: async ({ context, params }) => {
    const profile = await context.queryClient.ensureQueryData(
      convexQuery(api.paymentOrderProfiles.getBySlug, {
        orgSlug: params.slug,
        profileSlug: params.profileSlug,
      }),
    )

    if (!profile) {
      throw redirect({ to: '/orgs/$slug', params: { slug: params.slug } })
    }

    return { profile }
  },
  component: ProfileSettings,
})

function ProfileSettings() {
  const { authKitId } = authRoute.useLoaderData()
  const { slug, profileSlug } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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

  if (!profile) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        breadcrumbs={[
          { label: 'Betania', to: '/dashboard' },
          {
            label: profile.organizationName ?? 'Organization',
            to: '/orgs/$slug',
            params: { slug },
          },
          { label: profile.name },
        ]}
      />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-muted-foreground">
            Manage your payment order profile settings
          </p>
        </div>

        <div className="space-y-6">
          <ProfileDetailsCard
            profile={profile}
            authKitId={authKitId}
            slug={slug}
          />

          <TagsCard profile={profile} tags={tags} authKitId={authKitId} />
        </div>
      </main>
    </div>
  )
}

function ProfileDetailsCard({
  profile,
  authKitId,
  slug,
}: {
  profile: NonNullable<
    Awaited<ReturnType<typeof api.paymentOrderProfiles.getBySlug>>
  >
  authKitId: string
  slug: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: useConvexMutation(api.paymentOrderProfiles.update),
    onSuccess: (updated: Doc<'paymentOrderProfiles'> | null) => {
      toast.success('Profile updated!')
      queryClient.invalidateQueries()
      if (updated && updated.slug !== profile.slug) {
        navigate({
          to: '/orgs/$slug/profiles/$profileSlug',
          params: { slug, profileSlug: updated.slug },
        })
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: useConvexMutation(api.paymentOrderProfiles.delete_),
    onSuccess: () => {
      toast.success('Profile deleted')
      navigate({ to: '/orgs/$slug', params: { slug } })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete profile')
    },
  })

  const form = useForm({
    defaultValues: {
      name: profile.name,
      isPublic: profile.isPublic,
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        authKitId,
        id: profile._id,
        name: value.name,
        isPublic: value.isPublic,
      })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Details</CardTitle>
        <CardDescription>Update your profile settings</CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <CardContent className="space-y-4">
          <form.Field name="name" validators={{ onChange: requiredString }}>
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="max-w-md"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field name="isPublic">
            {(field) => (
              <Field>
                <div className="flex max-w-md items-center justify-between">
                  <div>
                    <FieldLabel>Public Profile</FieldLabel>
                    <p className="text-muted-foreground text-sm">
                      Anyone can submit payment orders
                    </p>
                  </div>
                  <Switch
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                </div>
              </Field>
            )}
          </form.Field>
        </CardContent>
        <CardFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" type="button">
                Delete Profile
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Profile?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the profile and all associated
                  tags and payment orders.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    deleteMutation.mutate({ authKitId, id: profile._id })
                  }
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </form>
    </Card>
  )
}

type Tag = Doc<'tags'>

function TagsCard({
  profile,
  tags,
  authKitId,
}: {
  profile: NonNullable<
    Awaited<ReturnType<typeof api.paymentOrderProfiles.getBySlug>>
  >
  tags: Array<Tag>
  authKitId: string
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: useConvexMutation(api.tags.delete_),
    onSuccess: () => {
      toast.success('Tag deleted')
      queryClient.invalidateQueries()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete tag')
    },
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tags</CardTitle>
          <CardDescription>
            Tags categorize payment orders and define required file uploads
          </CardDescription>
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
                          {tag.fileRequirements.length} file requirement
                          {tag.fileRequirements.length !== 1 ? 's' : ''}
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
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Tag?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the tag from all payment orders.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            deleteMutation.mutate({ authKitId, id: tag._id })
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
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
            <p className="text-muted-foreground">No tags yet</p>
            <p className="text-muted-foreground text-sm">
              Create tags to categorize payment orders
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
]

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
  const queryClient = useQueryClient()
  const isEditing = !!tag

  const createMutation = useMutation({
    mutationFn: useConvexMutation(api.tags.create),
    onSuccess: () => {
      toast.success('Tag created!')
      queryClient.invalidateQueries()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create tag')
    },
  })

  const updateMutation = useMutation({
    mutationFn: useConvexMutation(api.tags.update),
    onSuccess: () => {
      toast.success('Tag updated!')
      queryClient.invalidateQueries()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update tag')
    },
  })

  const form = useForm({
    defaultValues: {
      name: tag?.name ?? '',
      color: tag?.color ?? TAG_COLORS[0],
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
        <DialogTrigger asChild>
          <Button>+ New Tag</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
          <DialogDescription>
            Tags help categorize payment orders
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
          <form.Field name="name" validators={{ onChange: requiredString }}>
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Invoice"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field name="color">
            {(field) => (
              <Field>
                <FieldLabel>Color</FieldLabel>
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
                  Description (optional)
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Used for monthly invoices"
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
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting
                    ? 'Saving...'
                    : isEditing
                      ? 'Save Changes'
                      : 'Create Tag'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
