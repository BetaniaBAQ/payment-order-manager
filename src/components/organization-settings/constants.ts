export const DEFAULT_INVITE_ROLE = 'member' as const

export const MEMBER_ROLE_OPTION_KEYS = [
  { value: 'member', labelKey: 'members.roleOptions.member' },
  { value: 'admin', labelKey: 'members.roleOptions.admin' },
] as const

export const SETTINGS_TABS = {
  GENERAL: 'general',
  MEMBERS: 'members',
  BILLING: 'billing',
} as const
