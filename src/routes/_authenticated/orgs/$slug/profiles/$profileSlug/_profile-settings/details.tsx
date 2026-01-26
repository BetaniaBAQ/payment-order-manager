import { useSuspenseQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'

import { Form } from '@/components/forms/form'
import { FormInput } from '@/components/forms/form-input'
import { FormSubmitButton } from '@/components/forms/form-submit-button'
import { EmailWhitelistCard } from '@/components/profile-settings/email-whitelist-card'
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
import { useMutationWithToast } from '@/hooks/use-mutation-with-toast'
import { ROUTES, TOAST_MESSAGES } from '@/lib/constants'
import { convexQuery } from '@/lib/convex'
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
    <div className="space-y-6">
      <ProfileDetailsCard profile={profile} authKitId={authKitId} slug={slug} />
      <EmailWhitelistCard profile={profile} authKitId={authKitId} />
    </div>
  )
}

function ProfileDetailsCard({
  profile,
  authKitId,
  slug,
}: {
  profile: NonNullable<
    FunctionReturnType<typeof api.paymentOrderProfiles.getBySlug>
  >
  authKitId: string
  slug: string
}) {
  const navigate = useNavigate()

  const updateMutation = useMutationWithToast(api.paymentOrderProfiles.update, {
    successMessage: TOAST_MESSAGES.profile.updated.success,
    errorMessage: TOAST_MESSAGES.profile.updated.error,
    onSuccess: (updated: Doc<'paymentOrderProfiles'> | null) => {
      if (updated) {
        navigate({
          to: ROUTES.profileSettings,
          params: { slug, profileSlug: updated.slug },
        })
      }
    },
  })

  const deleteMutation = useMutationWithToast(
    api.paymentOrderProfiles.delete_,
    {
      successMessage: TOAST_MESSAGES.profile.deleted.success,
      errorMessage: TOAST_MESSAGES.profile.deleted.error,
      onSuccess: () => navigate({ to: ROUTES.org, params: { slug } }),
    },
  )

  const form = useForm({
    defaultValues: {
      name: profile.name,
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        authKitId,
        id: profile._id,
        name: value.name,
      })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Details</CardTitle>
        <CardDescription>Update your profile settings</CardDescription>
      </CardHeader>
      <Form onSubmit={form.handleSubmit}>
        <CardContent className="space-y-4">
          <FormInput
            form={form}
            name="name"
            label="Name"
            validator={requiredString}
            className="max-w-md"
            autoFocus
          />
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
                  to: ROUTES.profileSettings,
                  params: { slug, profileSlug: profile.slug },
                })
              }
            >
              Cancel
            </Button>
            <FormSubmitButton
              form={form}
              label="Save Changes"
              loadingLabel="Saving..."
            />
          </div>
        </CardFooter>
      </Form>
    </Card>
  )
}
