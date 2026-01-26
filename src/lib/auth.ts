export type MemberRole = 'owner' | 'admin' | 'member'

/**
 * Check if a user has admin or owner privileges
 */
export function isOwnerOrAdmin(role: MemberRole | null | undefined): boolean {
  return role === 'owner' || role === 'admin'
}

/**
 * Alias for isOwnerOrAdmin - checks if user can manage organization resources
 */
export const canManageResource = isOwnerOrAdmin
