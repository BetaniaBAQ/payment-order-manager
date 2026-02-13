import { useSuspenseQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import { useTranslation } from 'react-i18next'
import type { Doc } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'


import { Form } from '@/components/forms/form'
import { FormInput } from '@/components/forms/form-input'
import { FormSubmitButton } from '@/components/forms/form-submit-button'
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
import { ROUTES } from '@/lib/constants'
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
    <ProfileDetailsCard profile={profile} authKitId={authKitId} slug={slug} />
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
  const { t } = useTranslation('settings')
  const { t: tc } = useTranslation('common')

  const updateMutation = useMutationWithToast(api.paymentOrderProfiles.update, {
    successMessage: t('toast.profileUpdated'),
    errorMessage: t('toast.profileUpdatedError'),
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
      successMessage: t('toast.profileDeleted'),
      errorMessage: t('toast.profileDeletedError'),
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
        <CardTitle>{t('profile.detailsTitle')}</CardTitle>
        <CardDescription>{t('profile.detailsDescription')}</CardDescription>
      </CardHeader>
      <Form onSubmit={form.handleSubmit}>
        <CardContent className="space-y-4 pb-6">
          <FormInput
            form={form}
            name="name"
            label={t('profile.nameField')}
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
                  {t('profile.deleteProfile')}
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('profile.deleteTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('profile.deleteDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{tc('actions.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    deleteMutation.mutate({ authKitId, id: profile._id })
                  }
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {tc('actions.delete')}
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
              {tc('actions.cancel')}
            </Button>
            <FormSubmitButton
              form={form}
              label={tc('actions.saveChanges')}
              loadingLabel={tc('actions.saving')}
            />
          </div>
        </CardFooter>
      </Form>
    </Card>
  )
}
