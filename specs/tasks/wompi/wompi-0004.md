# 0004: Fix webhook signature verification

## Context

The current `verifyWompiSignature()` hardcodes the field concatenation order (`transactionId + status + amountInCents + timestamp + secret`). Wompi's docs specify that the event payload includes `signature.properties` — an array of dot-path field names that tells you which fields to concatenate and in what order. The current approach will break if Wompi changes or reorders the fields.

## Dependencies

- None (independent of Widget migration)

## Files

- `src/lib/wompi.ts` (edit — rewrite `verifyWompiSignature()`)
- `src/routes/api/webhooks/wompi.ts` (edit — update handler to pass structured data)

## Requirements

### Rewrite `verifyWompiSignature()`

Current (wrong):

```typescript
export function verifyWompiSignature(params: {
  transactionId: string
  status: string
  amountInCents: number
  timestamp: number
  signature: string
}): boolean {
  const seed = `${params.transactionId}${params.status}${params.amountInCents}${params.timestamp}${process.env.WOMPI_EVENTS_SECRET}`
  const hash = createHash('sha256').update(seed).digest('hex')
  return hash === params.signature
}
```

New (correct — dynamic field resolution):

```typescript
export function verifyWompiSignature(params: {
  data: Record<string, unknown>
  signature: { properties: string[]; checksum: string }
  timestamp: number
}): boolean {
  // 1. Resolve each property path from the event data
  const values = params.signature.properties.map((prop) =>
    prop
      .split('.')
      .reduce<unknown>(
        (obj, key) => (obj as Record<string, unknown>)?.[key],
        params.data,
      ),
  )

  // 2. Concatenate values + timestamp + events secret
  const seed =
    values.join('') + params.timestamp + process.env.WOMPI_EVENTS_SECRET

  // 3. SHA256 hash and compare
  const hash = createHash('sha256').update(seed).digest('hex')
  return hash === params.signature.checksum
}
```

### Update webhook handler

Current handler extracts individual fields and passes them. Change to pass the full event structure:

```typescript
POST: async ({ request }) => {
  const body = await request.json()

  const isValid = verifyWompiSignature({
    data: body.data,
    signature: body.signature,
    timestamp: body.timestamp,
  })

  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Extract transaction data after verification
  const tx = body.data.transaction
  await convex.mutation(api.subscriptions.handleWompiEvent, {
    reference: tx.reference,
    status: tx.status,
    transactionId: tx.id,
    paymentMethod: tx.payment_method_type,
    amountInCents: tx.amount_in_cents,
  })

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
```

### Also verify via header

Wompi sends `X-Event-Checksum` header as an additional check. Optionally verify it matches `body.signature.checksum`:

```typescript
const headerChecksum = request.headers.get('X-Event-Checksum')
if (headerChecksum && headerChecksum !== body.signature.checksum) {
  return new Response(JSON.stringify({ error: 'Checksum mismatch' }), {
    status: 401,
  })
}
```

## Definition of Done

- [ ] `verifyWompiSignature()` reads `signature.properties` dynamically
- [ ] Webhook handler passes full event structure to verification
- [ ] Handler still correctly extracts transaction data for `handleWompiEvent` mutation
- [ ] Returns 401 for invalid signatures, 200 for valid
- [ ] No TypeScript errors
