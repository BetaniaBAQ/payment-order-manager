# Wompi Integration — Correct Implementation

## Summary

Replace custom checkout UI with Wompi's official Widget + JS fingerprinting library. Fix PCI compliance (card data never touches our server), add integrity signatures, fix webhook verification, and wire up fraud prevention.

## Decisions

1. **Post-payment flow**: Show success view with two options: go to billing settings or go back to previous view. No redirect — Widget stays in modal context.
2. **Expiration**: 30 minutes minimum via `expirationTime` ISO8601 param.
3. **Recurring billing**: Included as wompi-0007. Implements `chargeWompiSubscription` internalAction stub.
4. **Tax breakdown**: Include `taxInCents.vat` (IVA 19%) extracted from tax-inclusive prices. `consumption = 0` for SaaS. No shipping address needed.

## Current Problems

1. **PCI violation**: `CardTab` collects raw card numbers → sends through server functions → our server sees card data
2. **No integrity signature**: Transactions can be tampered (amount, reference) — missing `WOMPI_INTEGRITY_SECRET`
3. **Webhook verification hardcoded**: `verifyWompiSignature()` hardcodes field order instead of reading `signature.properties`
4. **No fraud prevention**: Wompi JS fingerprinting library not loaded — no `sessionId`/`deviceId` sent
5. **No acceptance tokens**: Colombian Habeas Data law requires user consent before payment
6. **Bugs in upgrade-modal.tsx**: `amountInCents={0}` hardcoded, `customerEmail=""` empty

## Architecture

### Payment Flow (New)

```
User selects tier in UpgradeModal
         ↓
Backend generates integrity signature:
  SHA256(reference + amountInCents + "COP" + WOMPI_INTEGRITY_SECRET)
         ↓
WidgetCheckout opens (Wompi-hosted UI)
  - Handles card input (PCI compliant)
  - Shows Nequi, PSE, Bancolombia, Card options
  - Includes acceptance tokens automatically
  - Receives sessionId from Wompi JS
         ↓
User completes payment in widget
         ↓
Widget callback fires → transaction.id returned
         ↓
Wompi sends webhook → POST /api/webhooks/wompi
         ↓
Webhook reads signature.properties → dynamic verification
         ↓
handleWompiEvent mutation updates subscription in Convex
```

### Three Pieces

| Piece            | URL                                       | Purpose                               |
| ---------------- | ----------------------------------------- | ------------------------------------- |
| **Wompi JS**     | `https://wompijs.wompi.com/libs/js/v1.js` | Fingerprinting / fraud prevention     |
| **Wompi Widget** | `https://checkout.wompi.co/widget.js`     | Payment UI (PCI compliant)            |
| **Backend**      | Server functions                          | Integrity signature, webhook handling |

## Environment Variables

```env
# Existing
WOMPI_PUBLIC_KEY=pub_test_xxx        # Widget + client-side
WOMPI_PRIVATE_KEY=prv_test_xxx       # Server-side API calls (keep for recurring billing)
WOMPI_EVENTS_SECRET=test_events_xxx  # Webhook signature verification

# New
WOMPI_INTEGRITY_SECRET=test_integrity_xxx  # Integrity signature generation
```

All 4 from Wompi dashboard → Desarrolladores → Llaves de API.

## Changes

### Task 1: Load Wompi JS + Widget scripts

**Files:**

- `src/routes/__root.tsx` — add both `<script>` tags to `<head>`
- `src/lib/wompi.ts` — add `initWompi()` helper and TypeScript declarations

**Details:**

- Add to `RootDocument` head section:
  ```html
  <script src="https://checkout.wompi.co/widget.js"></script>
  <script
    src="https://wompijs.wompi.com/libs/js/v1.js"
    data-public-key="{publicKey}"
  ></script>
  ```
- Public key needs to come from server → add a `getWompiPublicKey` server function or pass via env prefix `VITE_WOMPI_PUBLIC_KEY`
- Add global type declarations for `$wompi` and `WidgetCheckout`:
  ```typescript
  declare global {
    const $wompi: {
      initialize(
        cb: (
          data: { sessionId: string; deviceData: { deviceID: string } },
          error: unknown,
        ) => void,
      ): void
    }
    class WidgetCheckout {
      constructor(config: WompiWidgetConfig)
      open(cb: (result: { transaction: WompiTransaction }) => void): void
    }
  }
  ```

### Task 2: Backend — integrity signature + session management

**Files:**

- `src/lib/wompi.ts` — add `generateIntegritySignature()`, update types
- New server function in checkout component or `src/lib/wompi.ts`

**Details:**

- Integrity signature (server-side only):

  ```typescript
  import { createHash } from 'node:crypto'

  export function generateIntegritySignature(params: {
    reference: string
    amountInCents: number
    currency: string
  }): string {
    const seed = `${params.reference}${params.amountInCents}${params.currency}${process.env.WOMPI_INTEGRITY_SECRET}`
    return createHash('sha256').update(seed).digest('hex')
  }
  ```

- Server function to prepare checkout data:
  ```typescript
  const prepareWompiCheckout = createServerFn({ method: 'POST' })
    .validator((data: { reference: string; amountInCents: number }) => data)
    .handler(async ({ data }) => ({
      publicKey: process.env.WOMPI_PUBLIC_KEY,
      signature: generateIntegritySignature({
        reference: data.reference,
        amountInCents: data.amountInCents,
        currency: 'COP',
      }),
    }))
  ```

### Task 3: Replace WompiCheckout with Widget

**Files:**

- `src/components/billing/wompi-checkout.tsx` — **rewrite** (610 lines → ~80 lines)
- `src/components/billing/upgrade-modal.tsx` — fix props, pass correct amount/email

**Details:**

New `wompi-checkout.tsx`:

```typescript
export function WompiCheckout({
  amountInCents,
  reference,
  customerEmail,
  onSuccess,
  onError,
}: WompiCheckoutProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    try {
      // 1. Get integrity signature from server
      const { publicKey, signature } = await prepareWompiCheckout({
        data: { reference, amountInCents },
      })

      // 2. Open Wompi Widget
      const checkout = new WidgetCheckout({
        currency: 'COP',
        amountInCents,
        reference,
        publicKey,
        signature: { integrity: signature },
        redirectUrl: window.location.href,
        customerData: {
          email: customerEmail,
        },
      })

      checkout.open((result) => {
        if (result.transaction) {
          onSuccess()
        }
      })
    } catch {
      onError('Error initiating payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handlePayment} disabled={loading}>
      {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
      Pay {formatAmount(amountInCents)} COP
    </Button>
  )
}
```

Fix `upgrade-modal.tsx`:

- Pass real `amountInCents` from tier pricing (currently hardcoded `0`)
- Pass real `customerEmail` from `useUser()` (currently hardcoded `""`)

### Task 4: Fix webhook signature verification

**Files:**

- `src/lib/wompi.ts` — rewrite `verifyWompiSignature()`
- `src/routes/api/webhooks/wompi.ts` — update handler to pass full event body

**Details:**

Current (wrong — hardcoded field order):

```typescript
const seed = `${transactionId}${status}${amountInCents}${timestamp}${secret}`
```

Correct (dynamic — reads `signature.properties`):

```typescript
export function verifyWompiSignature(params: {
  event: Record<string, unknown>
  signature: { properties: string[]; checksum: string }
  timestamp: number
}): boolean {
  // 1. Concatenate values from properties in order
  const values = params.signature.properties.map((prop) => {
    // prop is like "transaction.id" or "transaction.status"
    return prop.split('.').reduce((obj, key) => obj?.[key], params.event)
  })

  // 2. Append timestamp + events secret
  const seed =
    values.join('') + params.timestamp + process.env.WOMPI_EVENTS_SECRET
  const hash = createHash('sha256').update(seed).digest('hex')

  return hash === params.signature.checksum
}
```

Update webhook handler to pass the full structured data.

### Task 5: Initialize Wompi JS fingerprinting (moved from original plan position)

**Files:**

- `src/hooks/use-wompi-session.ts` — new hook
- `src/components/billing/wompi-checkout.tsx` — use hook to pass `sessionId`

**Details:**

```typescript
// src/hooks/use-wompi-session.ts
export function useWompiSession() {
  const [session, setSession] = useState<{
    sessionId: string
    deviceId: string
  } | null>(null)

  useEffect(() => {
    if (typeof $wompi !== 'undefined') {
      $wompi.initialize((data, error) => {
        if (!error) {
          setSession({
            sessionId: data.sessionId,
            deviceId: data.deviceData.deviceID,
          })
        }
      })
    }
  }, [])

  return session
}
```

### Task 6: Cleanup

**Files:**

- `src/lib/wompi.ts` — remove `tokenizeCard()`, `createPaymentSource()`, `getWompiPSEBanks()` (widget handles all this)
- `src/i18n/locales/en/billing.json` — remove `wompi.card.*`, `wompi.pse.*`, `wompi.nequi.*` keys (widget has its own UI)
- `src/i18n/locales/es/billing.json` — same cleanup
- Keep `createWompiTransaction()` — needed for future recurring billing (`chargeWompiSubscription`)
- Keep `WOMPI_PRIVATE_KEY` — needed for server-side recurring charges

### Task 7: Implement recurring billing (`chargeWompiSubscription`)

**Files:**

- `convex/subscriptions.ts` — implement `chargeWompiSubscription` handler + add `markPastDueAndNotify` internalMutation

**Details:**

- Query subscription + org owner email via `ctx.runQuery(internal.emailsInternal.getBillingData)`
- Call Wompi API via `fetch` directly (Convex runtime can't import `src/lib/wompi.ts`)
- Reference format: `sub_{orgId}_{tier}_{timestamp}`
- On success: log transaction ID, webhook (`handleWompiEvent`) handles APPROVED/DECLINED
- On failure: `markPastDueAndNotify` internalMutation marks `past_due` + schedules `PAYMENT_FAILED` email
- Requires `WOMPI_PRIVATE_KEY` set in Convex environment (not just `.env.local`)

## Tax Breakdown (IVA)

Prices in `TIER_PRICES` are **tax-inclusive** (IVA 19%). Extract IVA for Wompi receipt:

```typescript
// convex/lib/tierLimits.ts
export const IVA_RATE = 0.19

export function calculateCopTaxBreakdown(totalInCents: number) {
  const baseInCents = Math.round(totalInCents / (1 + IVA_RATE))
  const vatInCents = totalInCents - baseInCents
  return { baseInCents, vatInCents, consumptionInCents: 0 }
}
```

- Pro monthly: 199,000 COP total → ~167,227 base + ~31,773 IVA
- Passed to Widget as `taxInCents: { vat, consumption: 0 }` (informational, not added to total)
- Wired through `createCheckoutSession` → `upgrade-modal.tsx` → `WompiCheckout` → Widget

## Task Order

| #   | Task                                              | Depends on                  |
| --- | ------------------------------------------------- | --------------------------- |
| 1   | Load scripts in root                              | —                           |
| 2   | Backend integrity signature                       | —                           |
| 3   | Replace WompiCheckout with Widget + IVA breakdown | 1, 2                        |
| 4   | Fix webhook verification                          | —                           |
| 5   | Wompi JS fingerprinting hook                      | 1                           |
| 6   | Cleanup dead code + translations                  | 3                           |
| 7   | Implement recurring billing                       | 4 (webhook must work first) |

Tasks 1, 2, 4 can be done in parallel. Task 3 is the main change. Task 7 is independent of Widget but needs working webhooks.

## Testing

- **Sandbox keys**: Use `pub_test_` / `prv_test_` keys from Wompi dashboard
- **Test card**: `4242 4242 4242 4242`, any future expiry, any CVC
- **Test Nequi**: Phone `3991111111` → auto-approves in sandbox
- **Webhook testing**: Use Wompi dashboard to send test events, or ngrok/cloudflare tunnel for local dev
- **Verify**: Card numbers never appear in server logs or network tab to your server
