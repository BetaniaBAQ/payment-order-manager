import { useNavigate } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import { useTranslation } from 'react-i18next'
import type { FunctionReturnType } from 'convex/server'


import type { Organization } from './types'
import { Form } from '@/components/forms/form'
import { FormInput } from '@/components/forms/form-input'
import { FormSubmitButton } from '@/components/forms/form-submit-button'
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog'
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
import { useForm } from '@/lib/form'
import { requiredString } from '@/lib/validators'


type GeneralSettingsProps = {
  org: Organization
  authKitId: string
  isOwner: boolean
  slug: string
}

export function GeneralSettings({
  org,
  authKitId,
  isOwner,
  slug,
}: GeneralSettingsProps) {
  const { t } = useTranslation('settings')
  const { t: tc } = useTranslation('common')
  const navigate = useNavigate()

  type UpdateResult = FunctionReturnType<typeof api.organizations.update>

  const updateOrgMutation = useMutationWithToast(api.organizations.update, {
    successMessage: t('toast.orgUpdated'),
    errorMessage: t('toast.orgUpdatedError'),
    onSuccess: (updatedOrg: UpdateResult) => {
      if (updatedOrg && updatedOrg.slug !== slug) {
        navigate({
          to: ROUTES.orgSettings,
          params: { slug: updatedOrg.slug },
        })
      }
    },
  })

  const deleteOrgMutation = useMutationWithToast(api.organizations.delete_, {
    successMessage: t('toast.orgDeleted'),
    errorMessage: t('toast.orgDeletedError'),
    onSuccess: () => navigate({ to: ROUTES.dashboard }),
  })

  const form = useForm({
    defaultValues: {
      name: org.name,
    },
    onSubmit: async ({ value }) => {
      await updateOrgMutation.mutateAsync({
        authKitId,
        id: org._id,
        name: value.name,
      })
    },
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('general.title')}</CardTitle>
          <CardDescription>{t('general.description')}</CardDescription>
        </CardHeader>
        <Form onSubmit={form.handleSubmit} className="flex flex-col gap-4">
          <CardContent>
            <FormInput
              form={form}
              name="name"
              label={t('general.nameField')}
              validator={requiredString}
              className="max-w-md"
            />
          </CardContent>
          <CardFooter>
            <FormSubmitButton
              form={form}
              label={tc('actions.saveChanges')}
              loadingLabel={tc('actions.saving')}
            />
          </CardFooter>
        </Form>
      </Card>

      {isOwner && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t('general.dangerZone')}
            </CardTitle>
            <CardDescription>{t('general.dangerDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {t('general.dangerWarning')}
            </p>
          </CardContent>
          <CardFooter>
            <DeleteConfirmDialog
              title={t('general.deleteConfirmTitle')}
              description={t('general.deleteConfirmDescription', {
                name: org.name,
              })}
              onConfirm={() =>
                deleteOrgMutation.mutate({ authKitId, id: org._id })
              }
              trigger={
                <Button variant="destructive">{t('general.deleteOrg')}</Button>
              }
              isPending={deleteOrgMutation.isPending}
            />
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
