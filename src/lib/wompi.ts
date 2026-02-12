import { createHash } from 'node:crypto'

const WOMPI_API =
  process.env.NODE_ENV === 'production'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1'

// --- Types ---

interface CreateTransactionParams {
  amountInCents: number
  currency: 'COP'
  customerEmail: string
  reference: string
  paymentSourceId?: string
}

interface VerifySignatureParams {
  data: Record<string, unknown>
  signature: { properties: Array<string>; checksum: string }
  timestamp: number
}

// --- API Functions ---

export async function createWompiTransaction(params: CreateTransactionParams) {
  const response = await fetch(`${WOMPI_API}/transactions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount_in_cents: params.amountInCents,
      currency: params.currency,
      customer_email: params.customerEmail,
      reference: params.reference,
      payment_source_id: params.paymentSourceId,
    }),
  })

  return response.json()
}

function resolveProperty(data: Record<string, unknown>, path: string): unknown {
  let current: unknown = data
  for (const key of path.split('.')) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

export function verifyWompiSignature(params: VerifySignatureParams): boolean {
  const values = params.signature.properties.map((prop) =>
    resolveProperty(params.data, prop),
  )

  const seed =
    values.join('') + params.timestamp + (process.env.WOMPI_EVENTS_SECRET ?? '')
  const hash = createHash('sha256').update(seed).digest('hex')
  return hash === params.signature.checksum
}

export function generateIntegritySignature(params: {
  reference: string
  amountInCents: number
  currency: string
}): string {
  const seed = `${params.reference}${params.amountInCents}${params.currency}${process.env.WOMPI_INTEGRITY_SECRET}`
  return createHash('sha256').update(seed).digest('hex')
}
