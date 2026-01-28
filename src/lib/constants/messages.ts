// Toast messages for mutations
export const TOAST_MESSAGES = {
  organization: {
    created: {
      success: 'Organization created!',
      error: 'Failed to create organization',
    },
    updated: {
      success: 'Organization updated!',
      error: 'Failed to update organization',
    },
    deleted: {
      success: 'Organization deleted',
      error: 'Failed to delete organization',
    },
  },
  member: {
    removed: { success: 'Member removed', error: 'Failed to remove member' },
    roleUpdated: { success: 'Role updated', error: 'Failed to update role' },
  },
  invite: {
    sent: { success: 'Invite sent!', error: 'Failed to send invite' },
  },
  profile: {
    created: { success: 'Profile created!', error: 'Failed to create profile' },
    updated: { success: 'Profile updated!', error: 'Failed to update profile' },
    deleted: { success: 'Profile deleted', error: 'Failed to delete profile' },
    emailAdded: {
      success: 'Email added to whitelist',
      error: 'Failed to add email',
    },
    emailRemoved: { success: 'Email removed', error: 'Failed to remove email' },
  },
  paymentOrder: {
    created: {
      success: 'Payment order created!',
      error: 'Failed to create payment order',
    },
  },
} as const

// Default error message when none is provided
export const DEFAULT_ERROR_MESSAGE = 'Operation failed'
