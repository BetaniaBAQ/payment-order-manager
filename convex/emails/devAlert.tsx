import { Heading, Hr, Section, Text } from '@react-email/components'

import { EmailLayout } from './base'

type Props = {
  subject: string
  orderId: string
  fromStatus: string
  toStatus: string
  timestamp: string
}

export function DevAlertEmail({
  subject,
  orderId,
  fromStatus,
  toStatus,
  timestamp,
}: Props) {
  return (
    <EmailLayout preview={`[DEV] ${subject}`}>
      <Section className="rounded-md border border-red-200 bg-red-50 p-4">
        <Heading className="m-0 text-lg font-semibold text-red-700">
          Email Flow Issue
        </Heading>
      </Section>

      <Text className="text-gray-700">
        A status transition occurred without a configured email notification.
      </Text>

      <Section className="rounded-md bg-gray-50 p-4">
        <Text className="m-0 text-sm text-gray-600">
          <strong>Order ID:</strong> {orderId}
        </Text>
        <Text className="m-0 text-sm text-gray-600">
          <strong>From Status:</strong>{' '}
          <code className="rounded bg-gray-200 px-1">{fromStatus}</code>
        </Text>
        <Text className="m-0 text-sm text-gray-600">
          <strong>To Status:</strong>{' '}
          <code className="rounded bg-gray-200 px-1">{toStatus}</code>
        </Text>
        <Text className="m-0 text-sm text-gray-600">
          <strong>Timestamp:</strong> {timestamp}
        </Text>
      </Section>

      <Hr className="border-gray-200" />

      <Text className="text-sm text-gray-500">
        Consider adding a notification type for this status transition in{' '}
        <code className="rounded bg-gray-100 px-1 text-xs">
          convex/schema/notifications.ts
        </code>
      </Text>
    </EmailLayout>
  )
}
