import { Badge } from '@/components/ui/badge'

interface ProfileVisibilityBadgeProps {
  isPublic: boolean
}

export function ProfileVisibilityBadge({
  isPublic,
}: ProfileVisibilityBadgeProps) {
  return (
    <Badge variant={isPublic ? 'secondary' : 'outline'}>
      {isPublic ? 'Public' : 'Private'}
    </Badge>
  )
}
