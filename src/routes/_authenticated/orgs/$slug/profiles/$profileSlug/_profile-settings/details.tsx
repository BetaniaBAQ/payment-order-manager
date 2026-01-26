import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  createFileRoute,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import type { Doc } from 'convex/_generated/dataModel'


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
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { convexQuery, useConvexMutation } from '@/lib/convex'
import { useForm } from '@/lib/form'
import { requiredString } from '@/lib/validators'

const authRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute(
  '/_authenticated/orgs/$slug/profiles/$profileSlug/_profile-settings/details',
)({
  component: ProfileDetailsPage,
})

function ProfileDetailsPage() {
  const { authKitId } = authRoute.useLoaderData()
  const { slug, profileSlug } = Route.useParams()

  const { data: profile } = useSuspenseQuery(
    convexQuery(api.paymentOrderProfiles.getBySlug, {
      orgSlug: slug,
      profileSlug,
    }),
  )

  if (!profile) {
    return null
  }

  return (
    <ProfileDetailsCard profile={profile} authKitId={authKitId} slug={slug} />
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
      if (updated) {
        navigate({
          to: '/orgs/$slug/profiles/$profileSlug/settings',
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
                <FieldLabel htmlFor="profile-name-input">Name</FieldLabel>
                <FieldContent>
                  <Input
                    id="profile-name-input"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="max-w-md"
                    autoFocus
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
            <AlertDialogTrigger
              render={
                <Button variant="destructive" type="button">
                  Delete Profile
                </Button>
              }
            />
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

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate({
                  to: '/orgs/$slug/profiles/$profileSlug/settings',
                  params: { slug, profileSlug: profile.slug },
                })
              }
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
