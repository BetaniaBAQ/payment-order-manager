import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  getRouteApi,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
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
import { convexQuery, useConvexMutation } from '@/lib/convex'
import { useForm } from '@/lib/form'
import { requiredString } from '@/lib/validators'

const authRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute('/_authenticated/orgs/$slug/profiles/new')(
  {
    loader: async ({ context, params }) => {
      const org = await context.queryClient.ensureQueryData(
        convexQuery(api.organizations.getBySlug, { slug: params.slug }),
      )

      if (!org) {
        throw redirect({ to: '/dashboard' })
      }

      return { org }
    },
    component: CreateProfile,
  },
)

function CreateProfile() {
  const { authKitId } = authRoute.useLoaderData()
  const { slug } = Route.useParams()
  const navigate = useNavigate()

  const { data: org } = useSuspenseQuery(
    convexQuery(api.organizations.getBySlug, { slug }),
  )

  const createProfileMutation = useMutation({
    mutationFn: useConvexMutation(api.paymentOrderProfiles.create),
    onSuccess: (profile: Doc<'paymentOrderProfiles'> | null) => {
      toast.success('Profile created!')
      if (profile) {
        navigate({
          to: '/orgs/$slug/profiles/$profileSlug',
          params: { slug, profileSlug: profile.slug },
        })
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create profile')
    },
  })

  const form = useForm({
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      if (!org) return
      await createProfileMutation.mutateAsync({
        authKitId,
        organizationId: org._id,
        name: value.name,
      })
    },
  })

  if (!org) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        breadcrumbs={[
          { label: 'Betania', to: '/dashboard' },
          { label: org.name, to: '/orgs/$slug', params: { slug } },
          { label: 'New Profile' },
        ]}
      />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Create Payment Order Profile</CardTitle>
              <CardDescription>
                A profile defines how payment orders are submitted to you
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
                      <FieldLabel htmlFor={field.name}>Profile Name</FieldLabel>
                      <FieldContent>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="My Payment Profile"
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
                  onClick={() =>
                    navigate({ to: '/orgs/$slug', params: { slug } })
                  }
                >
                  Cancel
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit || isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create Profile'}
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
