import { useNavigate } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
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
import { ROUTES, TOAST_MESSAGES } from '@/lib/constants'
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
  const navigate = useNavigate()

  type UpdateResult = FunctionReturnType<typeof api.organizations.update>

  const updateOrgMutation = useMutationWithToast(api.organizations.update, {
    successMessage: TOAST_MESSAGES.organization.updated.success,
    errorMessage: TOAST_MESSAGES.organization.updated.error,
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
    successMessage: TOAST_MESSAGES.organization.deleted.success,
    errorMessage: TOAST_MESSAGES.organization.deleted.error,
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
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Update your organization name</CardDescription>
        </CardHeader>
        <Form onSubmit={form.handleSubmit}>
          <CardContent>
            <FormInput
              form={form}
              name="name"
              label="Name"
              validator={requiredString}
              className="max-w-md"
            />
          </CardContent>
          <CardFooter>
            <FormSubmitButton
              form={form}
              label="Save Changes"
              loadingLabel="Saving..."
            />
          </CardFooter>
        </Form>
      </Card>

      {isOwner && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Once you delete an organization, there is no going back. This will
              permanently delete the organization and all associated data.
            </p>
          </CardContent>
          <CardFooter>
            <DeleteConfirmDialog
              title="Are you absolutely sure?"
              description={`This action cannot be undone. This will permanently delete the organization "${org.name}" and remove all associated data.`}
              onConfirm={() =>
                deleteOrgMutation.mutate({ authKitId, id: org._id })
              }
              trigger={
                <Button variant="destructive">Delete Organization</Button>
              }
              isPending={deleteOrgMutation.isPending}
            />
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
