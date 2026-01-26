import { Resend } from 'resend'

import { APP_EMAIL_FROM } from '@/lib/constants'
import { env } from '@/lib/env'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

export type SendEmailOptions = {
  to: string | Array<string>
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  if (!resend) {
    console.warn('Resend not configured - email not sent:', { to, subject })
    return { data: null, error: new Error('Resend not configured') }
  }

  const { data, error } = await resend.emails.send({
    from: from ?? APP_EMAIL_FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  })

  if (error) {
    console.error('Failed to send email:', error)
  }

  return { data, error }
}
