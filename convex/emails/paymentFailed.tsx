import { Heading, Text } from '@react-email/components'

import { EmailButton, EmailLayout } from './base'

type Props = {
  orgName: string
  planName: string
  errorMessage?: string
  billingUrl: string
}

export function PaymentFailedEmail({
  orgName,
  planName,
  errorMessage,
  billingUrl,
}: Props) {
  return (
    <EmailLayout preview={`Pago fallido - ${planName}`}>
      <Heading className="text-xl font-semibold text-gray-900">
        Pago fallido
      </Heading>

      <Text className="text-gray-700">
        Hola <strong>{orgName}</strong>, no pudimos procesar el pago de tu plan{' '}
        <strong>{planName}</strong>.
      </Text>

      {errorMessage ? (
        <Text className="text-gray-700">
          <strong>Detalle:</strong> {errorMessage}
        </Text>
      ) : null}

      <Text className="text-gray-700">
        Por favor actualiza tu método de pago para evitar la suspensión de tu
        cuenta.
      </Text>

      <Text className="mt-6">
        <EmailButton href={billingUrl} variant="warning">
          Actualizar pago
        </EmailButton>
      </Text>

      <Text className="mt-4 text-sm text-gray-500">
        Si necesitas ayuda, contáctanos a soporte@biobetania.com
      </Text>
    </EmailLayout>
  )
}
