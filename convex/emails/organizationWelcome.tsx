import { Button, Heading, Text } from '@react-email/components'

import { EmailLayout } from './base'

type Props = {
  organizationName: string
  organizationUrl: string
}

export function OrganizationWelcomeEmail({
  organizationName,
  organizationUrl,
}: Props) {
  return (
    <EmailLayout preview={`Welcome to ${organizationName}!`}>
      <Heading className="text-xl font-semibold text-gray-900">
        Welcome to {organizationName}!
      </Heading>

      <Text className="text-gray-700">
        You are now a member of <strong>{organizationName}</strong> on Betania.
      </Text>

      <Button
        href={organizationUrl}
        className="rounded-md bg-blue-600 px-6 py-3 text-white"
      >
        Go to Organization
      </Button>
    </EmailLayout>
  )
}
