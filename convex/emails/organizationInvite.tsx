import { Button, Heading, Text } from '@react-email/components'

import { EmailLayout } from './base'

type Props = {
  inviterName: string
  organizationName: string
  role: string
  inviteUrl: string
  expiryDays: number
}

export function OrganizationInviteEmail({
  inviterName,
  organizationName,
  role,
  inviteUrl,
  expiryDays,
}: Props) {
  return (
    <EmailLayout preview={`You've been invited to join ${organizationName}`}>
      <Heading className="text-xl font-semibold text-gray-900">
        You've been invited!
      </Heading>

      <Text className="text-gray-700">
        {inviterName} has invited you to join{' '}
        <strong>{organizationName}</strong> on Betania as {role}.
      </Text>

      <Button
        href={inviteUrl}
        className="rounded-md bg-blue-600 px-6 py-3 text-white"
      >
        Accept Invitation
      </Button>

      <Text className="mt-6 text-sm text-gray-500">
        This invite expires in {expiryDays} days.
      </Text>

      <Text className="text-sm text-gray-500">
        If you didn't expect this invitation, you can ignore this email.
      </Text>
    </EmailLayout>
  )
}
