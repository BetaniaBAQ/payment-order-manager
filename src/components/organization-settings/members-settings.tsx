import { useState } from 'react'

import { api } from 'convex/_generated/api'

import { useTranslation } from 'react-i18next'


import { InviteDialog } from './invite-dialog'
import { InviteRow } from './invite-row'
import { MemberRow } from './member-row'
import type { Invite, Member, Organization } from './types'
import { useMutationWithToast } from '@/hooks/use-mutation-with-toast'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
  const { t } = useTranslation('settings')
  const [inviteOpen, setInviteOpen] = useState(false)

  const removeMemberMutation = useMutationWithToast(
    api.organizationMemberships.removeMember,
    {
      successMessage: t('toast.memberRemoved'),
      errorMessage: t('toast.memberRemovedError'),
    },
  )

  const updateRoleMutation = useMutationWithToast(
    api.organizationMemberships.updateRole,
    {
      successMessage: t('toast.roleUpdated'),
      errorMessage: t('toast.roleUpdatedError'),
    },
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('members.title')}</CardTitle>
            <CardDescription>{t('members.description')}</CardDescription>
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
                <TableHead>{t('members.memberColumn')}</TableHead>
                <TableHead>{t('members.roleColumn')}</TableHead>
                <TableHead className="text-right">
                  {t('members.actionsColumn')}
                </TableHead>
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
            <CardTitle>{t('members.pendingInvites')}</CardTitle>
            <CardDescription>
              {t('members.pendingInvitesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('members.emailColumn')}</TableHead>
                  <TableHead>{t('members.roleColumn')}</TableHead>
                  <TableHead>{t('members.invitedByColumn')}</TableHead>
                  <TableHead className="text-right">
                    {t('members.actionsColumn')}
                  </TableHead>
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
