import { Heading, Text } from '@react-email/components'

import { EmailButton, EmailLayout } from './base'

type Props = {
  orderTitle: string
  amount: string
  comment?: string
  orderUrl: string
}

export function OrderApprovedEmail({
  orderTitle,
  amount,
  comment,
  orderUrl,
}: Props) {
  return (
    <EmailLayout preview={`Approved: ${orderTitle}`}>
      <Heading className="text-xl font-semibold text-green-700">
        Payment Order Approved
      </Heading>

      <Text className="text-gray-700">
        Your payment order has been approved.
      </Text>

      <Text className="text-gray-900">
        <strong>Title:</strong> {orderTitle}
      </Text>

      <Text className="text-gray-900">
        <strong>Approved Amount:</strong> {amount}
      </Text>

      {comment && (
        <Text className="rounded-md bg-gray-100 p-4 text-gray-700">
          <strong>Comment:</strong> {comment}
        </Text>
      )}

      <Text className="mt-6">
        <EmailButton href={orderUrl} variant="success">
          View Details
        </EmailButton>
      </Text>
    </EmailLayout>
  )
}
