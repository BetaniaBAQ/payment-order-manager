import { useState } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  getRouteApi,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'

import { Form } from '@/components/forms/form'
import { FormInput } from '@/components/forms/form-input'
import { FormSelect } from '@/components/forms/form-select'
import { FormSubmitButton } from '@/components/forms/form-submit-button'
import { AppHeader } from '@/components/shared/app-header'
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog'
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
import {
  useActionWithToast,
  useMutationWithToast,
} from '@/hooks/use-mutation-with-toast'
import { useUser } from '@/hooks/use-user'
import { isOwnerOrAdmin } from '@/lib/auth'
import { convexQuery } from '@/lib/convex'
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

  // Get org data (reactive)
  const { data: org } = useSuspenseQuery(
    convexQuery(api.organizations.getBySlug, { slug }),
  )

  const orgId = org?._id ?? ('' as Id<'organizations'>)

  // Get user's role
  const { data: memberRole } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getMemberRole, {
      organizationId: orgId,
      authKitId,
    }),
  )

  // Get members
  const { data: members } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getByOrganization, {
      organizationId: orgId,
    }),
  )

  // Get pending invites
  const { data: invites } = useSuspenseQuery(
    convexQuery(api.organizationInvites.getByOrganization, {
      organizationId: orgId,
    }),
  )

  if (!org || !memberRole) {
    return null
  }

  const isOwner = memberRole === 'owner'
  const canManage = isOwnerOrAdmin(memberRole)

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

      <main id="main-content" className="container mx-auto flex-1 px-4 py-8">
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
  org: NonNullable<FunctionReturnType<typeof api.organizations.getBySlug>>
  authKitId: string
  isOwner: boolean
  slug: string
}) {
  const navigate = useNavigate()

  type UpdateResult = FunctionReturnType<typeof api.organizations.update>

  const updateOrgMutation = useMutationWithToast(api.organizations.update, {
    successMessage: 'Organization updated!',
    errorMessage: 'Failed to update organization',
    onSuccess: (updatedOrg: UpdateResult) => {
      if (updatedOrg && updatedOrg.slug !== slug) {
        navigate({
          to: '/orgs/$slug/settings',
          params: { slug: updatedOrg.slug },
        })
      }
    },
  })

  const deleteOrgMutation = useMutationWithToast(api.organizations.delete_, {
    successMessage: 'Organization deleted',
    errorMessage: 'Failed to delete organization',
    onSuccess: () => navigate({ to: '/dashboard' }),
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
  org: NonNullable<FunctionReturnType<typeof api.organizations.getBySlug>>
  authKitId: string
  isOwner: boolean
  members: Array<Member>
  invites: Array<Invite>
  currentUserId?: string
}) {
  const [inviteOpen, setInviteOpen] = useState(false)

  const removeMemberMutation = useMutationWithToast(
    api.organizationMemberships.removeMember,
    {
      successMessage: 'Member removed',
      errorMessage: 'Failed to remove member',
    },
  )

  const updateRoleMutation = useMutationWithToast(
    api.organizationMemberships.updateRole,
    {
      successMessage: 'Role updated',
      errorMessage: 'Failed to update role',
    },
  )

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
                        onValueChange={(newRole) => {
                          if (member.user && newRole) {
                            updateRoleMutation.mutate({
                              authKitId,
                              organizationId: org._id,
                              userId: member.user._id as Id<'users'>,
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
                                userId: member.user._id as Id<'users'>,
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
                  <InviteRow key={invite._id} invite={invite} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InviteRow({ invite }: { invite: Invite }) {
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
  org: NonNullable<FunctionReturnType<typeof api.organizations.getBySlug>>
  authKitId: string
}) {
  const inviteAction = useActionWithToast(api.organizationInvites.create, {
    successMessage: 'Invite sent!',
    errorMessage: 'Failed to send invite',
    onSuccess: () => onOpenChange(false),
  })

  const form = useForm({
    defaultValues: {
      email: '',
      role: 'member' as 'admin' | 'member',
    },
    onSubmit: async ({ value }) => {
      await inviteAction.mutateAsync({
        authKitId,
        organizationId: org._id,
        email: value.email,
        role: value.role,
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button>+ Invite Member</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation email to add someone to {org.name}
          </DialogDescription>
        </DialogHeader>
        <Form onSubmit={form.handleSubmit} className="space-y-4">
          <FormInput
            form={form}
            name="email"
            label="Email"
            type="email"
            placeholder="colleague@company.com"
            validator={emailValidator}
          />

          <FormSelect
            form={form}
            name="role"
            label="Role"
            options={[
              { value: 'member', label: 'Member - Can view and submit orders' },
              {
                value: 'admin',
                label: 'Admin - Can manage members and settings',
              },
            ]}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <FormSubmitButton
              form={form}
              label="Send Invite"
              loadingLabel="Sending..."
            />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
