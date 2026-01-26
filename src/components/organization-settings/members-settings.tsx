import { useState } from 'react'

import { api } from 'convex/_generated/api'

import { InviteDialog } from './invite-dialog'
import { InviteRow } from './invite-row'
import { MemberRow } from './member-row'
import type { Invite, Member, Organization } from './types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMutationWithToast } from '@/hooks/use-mutation-with-toast'
import { TOAST_MESSAGES } from '@/lib/constants'


type MembersSettingsProps = {
  org: Organization
  authKitId: string
  isOwner: boolean
  members: Array<Member>
  invites: Array<Invite>
  currentUserId?: string
}

export function MembersSettings({
  org,
  authKitId,
  isOwner,
  members,
  invites,
  currentUserId,
}: MembersSettingsProps) {
  const [inviteOpen, setInviteOpen] = useState(false)

  const removeMemberMutation = useMutationWithToast(
    api.organizationMemberships.removeMember,
    {
      successMessage: TOAST_MESSAGES.member.removed.success,
      errorMessage: TOAST_MESSAGES.member.removed.error,
    },
  )

  const updateRoleMutation = useMutationWithToast(
    api.organizationMemberships.updateRole,
    {
      successMessage: TOAST_MESSAGES.member.roleUpdated.success,
      errorMessage: TOAST_MESSAGES.member.roleUpdated.error,
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
                <MemberRow
                  key={member._id}
                  member={member}
                  org={org}
                  authKitId={authKitId}
                  isOwner={isOwner}
                  currentUserId={currentUserId}
                  onUpdateRole={updateRoleMutation.mutate}
                  onRemove={removeMemberMutation.mutate}
                  isRemoving={removeMemberMutation.isPending}
                />
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
