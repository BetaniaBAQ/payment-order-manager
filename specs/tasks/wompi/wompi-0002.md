# 0002: Backend integrity signature

## Context

Wompi requires a SHA256 integrity signature to prevent transaction tampering. The signature is computed server-side from `reference + amountInCents + currency + WOMPI_INTEGRITY_SECRET` and passed to the Widget when opening checkout.

## Dependencies

- None (independent backend work)

## Files

- `src/lib/wompi.ts` (edit — add `generateIntegritySignature()`)
- `src/components/billing/wompi-checkout.tsx` (edit — add `prepareWompiCheckout` server function)

## Requirements

1. Add `WOMPI_INTEGRITY_SECRET` to env:
   - Add to `src/lib/env.ts` schema if it exists, or document in `.env.example`
   - Value comes from Wompi dashboard → Desarrolladores → Llaves de API → Secreto de integridad

2. Add `generateIntegritySignature()` in `src/lib/wompi.ts`:

   ```typescript
   export function generateIntegritySignature(params: {
     reference: string
     amountInCents: number
     currency: string
   }): string {
     const seed = `${params.reference}${params.amountInCents}${params.currency}${process.env.WOMPI_INTEGRITY_SECRET}`
     return createHash('sha256').update(seed).digest('hex')
   }
   ```

   - `createHash` already imported from `node:crypto`
   - This function runs server-side only — secret never exposed to client

3. Add `prepareWompiCheckout` server function in `wompi-checkout.tsx`:
   ```typescript
   const prepareWompiCheckout = createServerFn({ method: 'POST' })
     .validator((data: { reference: string; amountInCents: number }) => data)
     .handler(async ({ data }) => ({
       publicKey: process.env.WOMPI_PUBLIC_KEY ?? '',
       signature: generateIntegritySignature({
         reference: data.reference,
         amountInCents: data.amountInCents,
         currency: 'COP',
       }),
     }))
   ```

## Definition of Done

- [ ] `generateIntegritySignature()` exported from `src/lib/wompi.ts`
- [ ] `prepareWompiCheckout` server function created
- [ ] `WOMPI_INTEGRITY_SECRET` documented as required env var
- [ ] Secret never appears in client-side bundles
- [ ] No TypeScript errors
