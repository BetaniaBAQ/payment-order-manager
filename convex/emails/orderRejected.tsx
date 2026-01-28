import { Heading, Text } from '@react-email/components'

import { EmailButton, EmailLayout } from './base'

type Props = {
  orderTitle: string
  reason: string
  orderUrl: string
}

export function OrderRejectedEmail({ orderTitle, reason, orderUrl }: Props) {
  return (
    <EmailLayout preview={`Rejected: ${orderTitle}`}>
      <Heading className="text-xl font-semibold text-gray-900">
        Payment Order Rejected
      </Heading>

      <Text className="text-gray-700">
        Your payment order has been rejected.
      </Text>

      <Text className="text-gray-900">
        <strong>Title:</strong> {orderTitle}
      </Text>

      <Text className="rounded-md bg-red-50 p-4 text-gray-700">
        <strong>Reason:</strong> {reason}
      </Text>

      <Text className="mt-6">
        <EmailButton href={orderUrl}>View Details</EmailButton>
      </Text>
    </EmailLayout>
  )
}
