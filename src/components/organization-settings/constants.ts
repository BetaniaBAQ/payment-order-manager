export const DEFAULT_INVITE_ROLE = 'member' as const

export const MEMBER_ROLE_OPTIONS = [
  { value: 'member', label: 'Member - Can view and submit orders' },
  { value: 'admin', label: 'Admin - Can manage members and settings' },
]

export const SETTINGS_TABS = {
  GENERAL: 'general',
  MEMBERS: 'members',
  BILLING: 'billing',
} as const
