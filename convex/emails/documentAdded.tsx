import { Heading, Text } from '@react-email/components'

import { EmailButton, EmailLayout } from './base'

type Props = {
  orderTitle: string
  documentName: string
  uploadedBy: string
  orderUrl: string
}

export function DocumentAddedEmail({
  orderTitle,
  documentName,
  uploadedBy,
  orderUrl,
}: Props) {
  return (
    <EmailLayout preview={`New document for: ${orderTitle}`}>
      <Heading className="text-xl font-semibold text-gray-900">
        New Document Uploaded
      </Heading>

      <Text className="text-gray-700">
        A new supporting document has been uploaded for a payment order.
      </Text>

      <Text className="text-gray-900">
        <strong>Payment Order:</strong> {orderTitle}
      </Text>

      <Text className="text-gray-900">
        <strong>Document:</strong> {documentName}
      </Text>

      <Text className="text-gray-900">
        <strong>Uploaded by:</strong> {uploadedBy}
      </Text>

      <Text className="mt-6">
        <EmailButton href={orderUrl}>Review Document</EmailButton>
      </Text>
    </EmailLayout>
  )
}
