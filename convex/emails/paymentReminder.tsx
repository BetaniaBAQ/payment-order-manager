import { Heading, Text } from '@react-email/components'

import { EmailButton, EmailLayout } from './base'

type Props = {
  orgName: string
  planName: string
  expiryDate: string
  renewUrl: string
}

export function PaymentReminderEmail({
  orgName,
  planName,
  expiryDate,
  renewUrl,
}: Props) {
  return (
    <EmailLayout preview={`Tu suscripción ${planName} vence pronto`}>
      <Heading className="text-xl font-semibold text-gray-900">
        Tu suscripción vence pronto
      </Heading>

      <Text className="text-gray-700">
        Hola <strong>{orgName}</strong>, tu plan <strong>{planName}</strong>{' '}
        vence el <strong>{expiryDate}</strong>.
      </Text>

      <Text className="text-gray-700">
        Renueva tu suscripción para seguir disfrutando de todas las
        funcionalidades de tu plan.
      </Text>

      <Text className="mt-6">
        <EmailButton href={renewUrl} variant="warning">
          Renovar ahora
        </EmailButton>
      </Text>

      <Text className="mt-4 text-sm text-gray-500">
        Si ya pagaste, ignora este email.
      </Text>
    </EmailLayout>
  )
}
