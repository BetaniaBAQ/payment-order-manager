import { Heading, Text } from '@react-email/components'

import { EmailButton, EmailLayout } from './base'

type Props = {
  orderTitle: string
  cancelledBy: string
  orderUrl: string
}

export function OrderCancelledEmail({
  orderTitle,
  cancelledBy,
  orderUrl,
}: Props) {
  return (
    <EmailLayout preview={`Cancelled: ${orderTitle}`}>
      <Heading className="text-xl font-semibold text-gray-900">
        Payment Order Cancelled
      </Heading>

      <Text className="text-gray-700">A payment order has been cancelled.</Text>

      <Text className="text-gray-900">
        <strong>Title:</strong> {orderTitle}
      </Text>

      <Text className="text-gray-900">
        <strong>Cancelled by:</strong> {cancelledBy}
      </Text>

      <Text className="mt-6">
        <EmailButton href={orderUrl}>View Details</EmailButton>
      </Text>
    </EmailLayout>
  )
}
