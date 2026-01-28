import { Heading, Text } from '@react-email/components'

import { EmailButton, EmailLayout } from './base'

type Props = {
  creatorName: string
  orderTitle: string
  amount: string
  reason: string
  orderUrl: string
}

export function OrderCreatedEmail({
  creatorName,
  orderTitle,
  amount,
  reason,
  orderUrl,
}: Props) {
  return (
    <EmailLayout preview={`New payment order: ${orderTitle}`}>
      <Heading className="text-xl font-semibold text-gray-900">
        New Payment Order
      </Heading>

      <Text className="text-gray-700">
        <strong>{creatorName}</strong> created a new payment order that requires
        your review.
      </Text>

      <Text className="text-gray-900">
        <strong>Title:</strong> {orderTitle}
      </Text>

      <Text className="text-gray-900">
        <strong>Amount:</strong> {amount}
      </Text>

      <Text className="text-gray-900">
        <strong>Reason:</strong> {reason}
      </Text>

      <Text className="mt-6">
        <EmailButton href={orderUrl}>View Payment Order</EmailButton>
      </Text>
    </EmailLayout>
  )
}
