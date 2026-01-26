import type { Id } from 'convex/_generated/dataModel'

import type { Member, Organization } from './types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TableCell, TableRow } from '@/components/ui/table'


type MemberRowProps = {
  member: Member
  org: Organization
  authKitId: string
  isOwner: boolean
  currentUserId?: string
  onUpdateRole: (params: {
    authKitId: string
    organizationId: Id<'organizations'>
    userId: Id<'users'>
    newRole: 'admin' | 'member' | 'owner'
  }) => void
  onRemove: (params: {
    authKitId: string
    organizationId: Id<'organizations'>
    userId: Id<'users'>
  }) => void
  isRemoving: boolean
}

export function MemberRow({
  member,
  org,
  authKitId,
  isOwner,
  currentUserId,
  onUpdateRole,
  onRemove,
  isRemoving,
}: MemberRowProps) {
  const canChangeRole = isOwner && member.role !== 'owner'
  const canRemove =
    member.role !== 'owner' && member.user?._id !== currentUserId

  return (
    <TableRow>
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
        {canChangeRole ? (
          <Select
            value={member.role}
            onValueChange={(value) => {
              const newRole = value as 'admin' | 'member'
              if (member.user) {
                onUpdateRole({
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
            variant={member.role === 'owner' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {member.role}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (member.user) {
                onRemove({
                  authKitId,
                  organizationId: org._id,
                  userId: member.user._id as Id<'users'>,
                })
              }
            }}
            disabled={isRemoving}
          >
            Remove
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}
