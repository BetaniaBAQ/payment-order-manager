# 0003: Replace WompiCheckout with Widget

## Context

The current `wompi-checkout.tsx` (610 lines) implements a custom payment UI that collects card numbers through our server — a PCI compliance violation. Replace it with Wompi's official `WidgetCheckout` which handles all payment methods, card input, and acceptance tokens in a Wompi-hosted iframe.

Also fix `upgrade-modal.tsx` which currently passes `amountInCents={0}` and `customerEmail=""`.

## Dependencies

- wompi-0001 (Widget script loaded)
- wompi-0002 (integrity signature server function)

## Files

- `src/components/billing/wompi-checkout.tsx` (rewrite — 610 lines → ~120 lines)
- `src/components/billing/upgrade-modal.tsx` (edit — fix props, add success view)
- `convex/lib/tierLimits.ts` (edit — add `IVA_RATE` + `calculateCopTaxBreakdown`)
- `src/lib/billing.ts` (edit — add `taxInCents` to Wompi checkout response)

## Requirements

### Rewrite `wompi-checkout.tsx`

1. Remove all existing tab components (`NequiTab`, `CardTab`, `PSETab`) and server functions (`serverCreateTransaction`, `serverGetPSEBanks`, `serverTokenizeCard`, `serverCreatePaymentSource`)

2. New component structure:

   ```typescript
   type WompiCheckoutProps = {
     amountInCents: number
     reference: string
     customerEmail: string
     onSuccess: () => void
     onError: (error: string) => void
   }

   export function WompiCheckout({
     amountInCents,
     reference,
     customerEmail,
     onSuccess,
     onError,
   }: WompiCheckoutProps) {
     // 1. Call prepareWompiCheckout server fn to get publicKey + integrity signature
     // 2. Open WidgetCheckout with config (including 30min expirationTime)
     // 3. Handle callback result
   }
   ```

3. Flow:
   - User clicks "Pay" button
   - Call `prepareWompiCheckout({ data: { reference, amountInCents } })` to get `publicKey` + `signature`
   - Compute `expirationTime` as ISO8601 string 30 min from now: `new Date(Date.now() + 30 * 60 * 1000).toISOString()`
   - Create `new WidgetCheckout({ currency, amountInCents, reference, publicKey, signature, expirationTime, customerData })`
   - Call `checkout.open(callback)` — Widget opens as overlay
   - On callback: call `onSuccess()` (final confirmation comes via webhook)
   - On error: call `onError(message)`

4. Remove `currency` from props — always `'COP'` for Wompi
5. Remove `organizationId` from props — not needed by Widget

### Add IVA tax breakdown

1. Add to `convex/lib/tierLimits.ts`:

   ```typescript
   export const IVA_RATE = 0.19

   export function calculateCopTaxBreakdown(totalInCents: number) {
     const baseInCents = Math.round(totalInCents / (1 + IVA_RATE))
     const vatInCents = totalInCents - baseInCents
     return { baseInCents, vatInCents, consumptionInCents: 0 }
   }
   ```

   Prices are tax-inclusive. Extract IVA: `base = total / 1.19`, `vat = total - base`. SaaS has no consumption tax.

2. Update `createCheckoutSession` in `src/lib/billing.ts` — add `taxInCents` to Wompi return:

   ```typescript
   const taxBreakdown = calculateCopTaxBreakdown(amountInCents)
   return {
     provider: 'wompi',
     amountInCents,
     currency: 'COP',
     reference: `sub_${data.organizationId}_${data.tier}_${Date.now()}`,
     taxInCents: { vat: taxBreakdown.vatInCents, consumption: 0 },
   }
   ```

3. Add `taxInCents` to `WompiCheckoutProps` and pass to Widget config:
   ```typescript
   taxInCents?: { vat: number; consumption: number }
   ```

### Fix `upgrade-modal.tsx`

1. Pass real `amountInCents` calculated from tier pricing (use `createCheckoutSession` or compute from `TIER_PRICES`)
2. Pass real `customerEmail` from `useUser()` hook
3. Pass `taxInCents` from checkout session to `WompiCheckout`
4. Remove any props no longer needed by new `WompiCheckout`

### Add success view to `upgrade-modal.tsx`

After payment succeeds, instead of immediately closing the modal, show a success state:

- Check icon + success message (e.g., "Payment successful!")
- Two buttons:
  - **"Go to Billing"** → navigate to billing settings page
  - **"Go Back"** → close modal, return to previous view
- This replaces the current `handleWompiSuccess` which just closes the modal

### i18n

- Keep minimal translations for the pay button, error states, and success view
- Add new keys for success view: `wompi.success.title`, `wompi.success.description`, `wompi.success.goToBilling`, `wompi.success.goBack`
- Remove all `wompi.nequi.*`, `wompi.card.*`, `wompi.pse.*` keys (Widget has its own UI) — done in wompi-0006

## Definition of Done

- [ ] `wompi-checkout.tsx` uses `WidgetCheckout` instead of custom payment forms
- [ ] No card numbers, CVCs, or sensitive payment data touch our server
- [ ] Widget receives `expirationTime` set to 30 min from now
- [ ] `upgrade-modal.tsx` passes correct `amountInCents` and `customerEmail`
- [ ] Success view shows after payment with "Go to Billing" and "Go Back" options
- [ ] `IVA_RATE` and `calculateCopTaxBreakdown` exported from `convex/lib/tierLimits.ts`
- [ ] `createCheckoutSession` returns `taxInCents` for Wompi path
- [ ] Widget receives `taxInCents` with correct IVA extraction (Pro: ~31,773 COP of 199,000)
- [ ] Widget opens successfully in sandbox with test keys
- [ ] `onSuccess` callback fires after test payment
- [ ] No TypeScript errors
