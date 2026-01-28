import { Heading, Text } from '@react-email/components'

import { EmailButton, EmailLayout } from './base'

type Props = {
  orderTitle: string
  comment: string
  orderUrl: string
}

export function OrderNeedsSupportEmail({
  orderTitle,
  comment,
  orderUrl,
}: Props) {
  return (
    <EmailLayout preview={`Action required: ${orderTitle}`}>
      <Heading className="text-xl font-semibold text-yellow-700">
        Action Required
      </Heading>

      <Text className="text-gray-700">
        Additional supporting documents have been requested for your payment
        order.
      </Text>

      <Text className="text-gray-900">
        <strong>Title:</strong> {orderTitle}
      </Text>

      <Text className="rounded-md bg-yellow-50 p-4 text-gray-700">
        <strong>Reviewer Comment:</strong> {comment}
      </Text>

      <Text className="mt-6">
        <EmailButton href={orderUrl} variant="warning">
          Add Supporting Documents
        </EmailButton>
      </Text>
    </EmailLayout>
  )
}
