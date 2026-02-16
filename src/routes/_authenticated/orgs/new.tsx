import {
  createFileRoute,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router'

import { api } from 'convex/_generated/api'

import { Buildings } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import type { Doc } from 'convex/_generated/dataModel'

import { Form } from '@/components/forms/form'
import { FormInput } from '@/components/forms/form-input'
import { FormSubmitButton } from '@/components/forms/form-submit-button'
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

const authRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute('/_authenticated/orgs/new')({
  component: CreateOrganization,
})

function CreateOrganization() {
  const { authKitId } = authRoute.useLoaderData()
  const navigate = useNavigate()
  const { t } = useTranslation('settings')
  const { t: tc } = useTranslation('common')

  const createOrgMutation = useMutationWithToast(api.organizations.create, {
    successMessage: t('toast.orgCreated'),
    errorMessage: t('toast.orgCreatedError'),
    onSuccess: (org: Doc<'organizations'> | null) => {
      if (org) {
        navigate({ to: ROUTES.org, params: { slug: org.slug } })
      }
    },
  })

  const form = useForm({
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      await createOrgMutation.mutateAsync({
        authKitId,
        name: value.name,
      })
    },
  })

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-lg">
        <Card className="border-l-primary border-l-4">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary rounded-lg p-2">
                <Buildings className="size-5" />
              </div>
              <div>
                <CardTitle>{t('newOrg.title')}</CardTitle>
                <CardDescription>{t('newOrg.description')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <Form onSubmit={form.handleSubmit}>
            <CardContent className="pb-6">
              <FormInput
                form={form}
                name="name"
                label={t('newOrg.nameField')}
                placeholder={t('newOrg.namePlaceholder')}
                validator={requiredString}
                autoFocus
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: ROUTES.dashboard })}
              >
                {tc('actions.cancel')}
              </Button>
              <FormSubmitButton
                form={form}
                label={t('newOrg.title')}
                loadingLabel={tc('actions.creating')}
              />
            </CardFooter>
          </Form>
        </Card>
      </div>
    </div>
  )
}
