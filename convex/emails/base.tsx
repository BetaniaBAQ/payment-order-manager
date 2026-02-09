import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import type { ReactNode } from 'react'


const APP_URL = process.env.VITE_APP_URL ?? 'http://localhost:3000'

type EmailLayoutProps = {
  preview: string
  children: ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="mx-auto bg-gray-100 font-sans">
          <Container className="mx-auto max-w-xl bg-white px-8 py-6">
            {/* Header */}
            <Section>
              <Text className="text-2xl font-bold text-gray-900">Betania</Text>
            </Section>

            <Hr className="border-gray-200" />

            {/* Content */}
            <Section className="py-4">{children}</Section>

            <Hr className="border-gray-200" />

            {/* Footer */}
            <Section className="py-4">
              <Text className="text-sm text-gray-500">
                This is an automated notification from Betania Payment Order
                Manager.
              </Text>
              <Text className="text-sm text-gray-500">
                <Link href={APP_URL} className="text-blue-600 underline">
                  Betania Payment Order Manager
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

type ButtonProps = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'success' | 'warning'
}

export function EmailButton({
  href,
  children,
  variant = 'primary',
}: ButtonProps) {
  const colors = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
  }

  return (
    <Link
      href={href}
      className={`inline-block rounded-md px-6 py-3 text-center text-sm font-medium text-white no-underline ${colors[variant]}`}
    >
      {children}
    </Link>
  )
}
