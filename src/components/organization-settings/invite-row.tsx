import type { Invite } from './types'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'


type InviteRowProps = {
  invite: Invite
}

export function InviteRow({ invite }: InviteRowProps) {
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
