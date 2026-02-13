import { useTranslation } from 'react-i18next'

import type { Invite } from './types'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'


type InviteRowProps = {
  invite: Invite
}

export function InviteRow({ invite }: InviteRowProps) {
  const { t } = useTranslation('settings')
  const { t: tc } = useTranslation('common')

  return (
    <TableRow>
      <TableCell>{invite.email}</TableCell>
      <TableCell>
        <Badge variant="secondary">{tc(`roles.${invite.role}`)}</Badge>
      </TableCell>
      <TableCell>{invite.inviter?.name ?? invite.inviter?.email}</TableCell>
      <TableCell className="text-right">
        <span className="text-muted-foreground text-sm">
          {t('members.pending')}
        </span>
      </TableCell>
    </TableRow>
  )
}
