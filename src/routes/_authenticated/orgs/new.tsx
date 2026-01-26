import {
  createFileRoute,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'

import { AppHeader } from '@/components/app-header'
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
import { useMutationWithToast } from '@/hooks/use-mutation-with-toast'
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
    successMessage: 'Organization created!',
    errorMessage: 'Failed to create organization',
    onSuccess: (org: Doc<'organizations'> | null) => {
      if (org) {
        navigate({ to: '/orgs/$slug', params: { slug: org.slug } })
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
          { label: 'Betania', to: '/dashboard' },
          { label: 'New Organization' },
        ]}
      />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Create Organization</CardTitle>
              <CardDescription>
                Create a new organization to manage payment orders
              </CardDescription>
            </CardHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
            >
              <CardContent>
                <form.Field
                  name="name"
                  validators={{
                    onChange: requiredString,
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Organization Name
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="My Organization"
                          autoFocus
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </FieldContent>
                    </Field>
                  )}
                </form.Field>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard' })}
                >
                  Cancel
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit || isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create Organization'}
                    </Button>
                  )}
                </form.Subscribe>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
