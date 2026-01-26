import {
  createFileRoute,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'

import { Form } from '@/components/forms/form'
import { FormInput } from '@/components/forms/form-input'
import { FormSubmitButton } from '@/components/forms/form-submit-button'
import { AppHeader } from '@/components/shared/app-header'
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
import {
  BREADCRUMB_LABELS,
  HOME_BREADCRUMB,
  ROUTES,
  TOAST_MESSAGES,
} from '@/lib/constants'
import { useForm } from '@/lib/form'
import { requiredString } from '@/lib/validators'

const authRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute('/_authenticated/orgs/new')({
  component: CreateOrganization,
})

function CreateOrganization() {
  const { authKitId } = authRoute.useLoaderData()
  const navigate = useNavigate()

  const createOrgMutation = useMutationWithToast(api.organizations.create, {
    successMessage: TOAST_MESSAGES.organization.created.success,
    errorMessage: TOAST_MESSAGES.organization.created.error,
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
    <div className="flex min-h-screen flex-col">
      <AppHeader
        breadcrumbs={[
          HOME_BREADCRUMB,
          { label: BREADCRUMB_LABELS.newOrganization },
        ]}
      />

      <main id="main-content" className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Create Organization</CardTitle>
              <CardDescription>
                Create a new organization to manage payment orders
              </CardDescription>
            </CardHeader>
            <Form onSubmit={form.handleSubmit}>
              <CardContent>
                <FormInput
                  form={form}
                  name="name"
                  label="Organization Name"
                  placeholder="My Organization"
                  validator={requiredString}
                  autoFocus
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: ROUTES.dashboard })}
                >
                  Cancel
                </Button>
                <FormSubmitButton
                  form={form}
                  label="Create Organization"
                  loadingLabel="Creating..."
                />
              </CardFooter>
            </Form>
          </Card>
        </div>
      </main>
    </div>
  )
}
