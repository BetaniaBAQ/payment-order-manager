import { useState } from 'react'

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  getRouteApi,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { api } from 'convex/_generated/api'

import { toast } from 'sonner'

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/hooks/use-user'
import { convexQuery, useConvexMutation } from '@/lib/convex'
import { useForm } from '@/lib/form'
import { email as emailValidator, requiredString } from '@/lib/validators'

const authRoute = getRouteApi('/_authenticated')

export const Route = createFileRoute('/_authenticated/orgs/$slug/settings')({
  loader: async ({ context, params }) => {
    const org = await context.queryClient.ensureQueryData(
      convexQuery(api.organizations.getBySlug, { slug: params.slug }),
    )

    if (!org) {
      throw redirect({ to: '/dashboard' })
    }

    return { org }
  },
  component: OrganizationSettings,
})

function OrganizationSettings() {
  const { authKitId } = authRoute.useLoaderData()
  const { slug } = Route.useParams()
  const user = useUser()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Get org data (reactive)
  const { data: org } = useSuspenseQuery(
    convexQuery(api.organizations.getBySlug, { slug }),
  )

  // Get user's role
  const { data: memberRole } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getMemberRole, {
      organizationId: org?._id ?? ('' as never),
      authKitId,
    }),
  )

  // Get members
  const { data: members } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getByOrganization, {
      organizationId: org?._id ?? ('' as never),
    }),
  )

  // Get pending invites
  const { data: invites } = useSuspenseQuery(
    convexQuery(api.organizationInvites.getByOrganization, {
      organizationId: org?._id ?? ('' as never),
    }),
  )

  if (!org || !memberRole) {
    return null
  }

  const isOwner = memberRole === 'owner'
  const isAdmin = memberRole === 'admin'
  const canManage = isOwner || isAdmin

  if (!canManage) {
    navigate({ to: '/orgs/$slug', params: { slug } })
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        breadcrumbs={[
          { label: 'Betania', to: '/dashboard' },
          { label: org.name, to: '/orgs/$slug', params: { slug } },
          { label: 'Settings' },
        ]}
      />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization settings and members
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettings
              org={org}
              authKitId={authKitId}
              isOwner={isOwner}
              slug={slug}
            />
          </TabsContent>

          <TabsContent value="members">
            <MembersSettings
              org={org}
              authKitId={authKitId}
              isOwner={isOwner}
              members={members}
              invites={invites}
              currentUserId={user?._id}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function GeneralSettings({
  org,
  authKitId,
  isOwner,
  slug,
}: {
  org: NonNullable<Awaited<ReturnType<typeof api.organizations.getBySlug>>>
  authKitId: string
  isOwner: boolean
  slug: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const updateOrgMutation = useMutation({
    mutationFn: useConvexMutation(api.organizations.update),
    onSuccess: (updatedOrg) => {
      toast.success('Organization updated!')
      if (updatedOrg && updatedOrg.slug !== slug) {
        navigate({
          to: '/orgs/$slug/settings',
          params: { slug: updatedOrg.slug },
        })
      }
      queryClient.invalidateQueries()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update organization')
    },
  })

  const deleteOrgMutation = useMutation({
    mutationFn: useConvexMutation(api.organizations.delete_),
    onSuccess: () => {
      toast.success('Organization deleted')
      navigate({ to: '/dashboard' })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete organization')
    },
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
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <FieldContent>
                    <Input
                      id={field.name}
                      name={field.name}
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
          </CardContent>
          <CardFooter>
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Organization</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the organization <strong>{org.name}</strong> and remove all
                    associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      deleteOrgMutation.mutate({ authKitId, id: org._id })
                    }
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteOrgMutation.isPending ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

type Member = {
  _id: string
  role: 'owner' | 'admin' | 'member'
  user: {
    _id: string
    name: string
    email: string
    avatarUrl?: string
  } | null
}

type Invite = {
  _id: string
  email: string
  role: 'admin' | 'member'
  inviter: {
    _id: string
    name: string
    email: string
  } | null
}

function MembersSettings({
  org,
  authKitId,
  isOwner,
  members,
  invites,
  currentUserId,
}: {
  org: NonNullable<Awaited<ReturnType<typeof api.organizations.getBySlug>>>
  authKitId: string
  isOwner: boolean
  members: Array<Member>
  invites: Array<Invite>
  currentUserId?: string
}) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const queryClient = useQueryClient()

  const removeMemberMutation = useMutation({
    mutationFn: useConvexMutation(api.organizationMemberships.removeMember),
    onSuccess: () => {
      toast.success('Member removed')
      queryClient.invalidateQueries()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove member')
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: useConvexMutation(api.organizationMemberships.updateRole),
    onSuccess: () => {
      toast.success('Role updated')
      queryClient.invalidateQueries()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update role')
    },
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              Manage who has access to this organization
            </CardDescription>
          </div>
          <InviteDialog
            open={inviteOpen}
            onOpenChange={setInviteOpen}
            org={org}
            authKitId={authKitId}
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user?.avatarUrl} />
                        <AvatarFallback>
                          {member.user?.name.charAt(0).toUpperCase() ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user?.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {member.user?.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isOwner && member.role !== 'owner' ? (
                      <Select
                        value={member.role}
                        onValueChange={(newRole: 'admin' | 'member') => {
                          if (member.user) {
                            updateRoleMutation.mutate({
                              authKitId,
                              organizationId: org._id,
                              userId: member.user._id as never,
                              newRole,
                            })
                          }
                        }}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant={
                          member.role === 'owner' ? 'default' : 'secondary'
                        }
                        className="capitalize"
                      >
                        {member.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.role !== 'owner' &&
                      member.user?._id !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (member.user) {
                              removeMemberMutation.mutate({
                                authKitId,
                                organizationId: org._id,
                                userId: member.user._id as never,
                              })
                            }
                          }}
                          disabled={removeMemberMutation.isPending}
                        >
                          Remove
                        </Button>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invites</CardTitle>
            <CardDescription>
              Invitations that have not been accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <InviteRow
                    key={invite._id}
                    invite={invite}
                    authKitId={authKitId}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InviteRow({
  invite,
  authKitId,
}: {
  invite: Invite
  authKitId: string
}) {
  // Note: revoke is an internal mutation, we need to expose it or use a different approach
  // For now, we'll just show the invite without revoke functionality
  return (
    <TableRow>
      <TableCell>{invite.email}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="capitalize">
          {invite.role}
        </Badge>
      </TableCell>
      <TableCell>{invite.inviter?.name ?? invite.inviter?.email}</TableCell>
      <TableCell className="text-right">
        <span className="text-muted-foreground text-sm">Pending</span>
      </TableCell>
    </TableRow>
  )
}

function InviteDialog({
  open,
  onOpenChange,
  org,
  authKitId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  org: NonNullable<Awaited<ReturnType<typeof api.organizations.getBySlug>>>
  authKitId: string
}) {
  const queryClient = useQueryClient()

  const inviteMutation = useMutation({
    mutationFn: useConvexMutation(api.organizationInvites.create),
    onSuccess: () => {
      toast.success('Invite sent!')
      queryClient.invalidateQueries()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send invite')
    },
  })

  const form = useForm({
    defaultValues: {
      email: '',
      role: 'member' as 'admin' | 'member',
    },
    onSubmit: async ({ value }) => {
      await inviteMutation.mutateAsync({
        authKitId,
        organizationId: org._id,
        email: value.email,
        role: value.role,
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>+ Invite Member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation email to add someone to {org.name}
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
          <form.Field
            name="email"
            validators={{
              onChange: emailValidator,
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="colleague@company.com"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field name="role">
            {(field) => (
              <Field>
                <FieldLabel>Role</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.state.value}
                    onValueChange={(value: 'admin' | 'member') =>
                      field.handleChange(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">
                        Member - Can view and submit orders
                      </SelectItem>
                      <SelectItem value="admin">
                        Admin - Can manage members and settings
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                  {isSubmitting ? 'Sending...' : 'Send Invite'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
