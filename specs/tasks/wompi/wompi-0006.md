# 0006: Cleanup dead code + translations

## Context

After replacing the custom checkout with Wompi Widget, several functions and translation keys are no longer needed. Clean them up to reduce bundle size and avoid confusion.

## Dependencies

- wompi-0003 (Widget replacement complete)

## Files

- `src/lib/wompi.ts` (edit — remove unused functions)
- `src/i18n/locales/en/billing.json` (edit — remove dead keys)
- `src/i18n/locales/es/billing.json` (edit — remove dead keys)

## Requirements

### Remove unused functions from `src/lib/wompi.ts`

Delete these functions (Widget handles them internally):

- `tokenizeCard()` — card tokenization handled by Widget
- `createPaymentSource()` — payment source creation handled by Widget
- `getWompiPSEBanks()` — bank list handled by Widget

Keep these:

- `createWompiTransaction()` — needed for future recurring billing (`chargeWompiSubscription` stub in `convex/subscriptions.ts`)
- `generateIntegritySignature()` — added in wompi-0002
- `verifyWompiSignature()` — rewritten in wompi-0004

Also remove associated types that are no longer used (`TokenizeCardParams`, `CreatePaymentSourceParams`, etc.)

### Remove dead translation keys

Remove from both `en/billing.json` and `es/billing.json`:

- `wompi.nequi.*` — all Nequi tab strings (phone label, hints, waiting states)
- `wompi.card.*` — all card tab strings (holder, number, expiry, CVC labels)
- `wompi.pse.*` — all PSE tab strings (bank, person type, doc type labels)

Keep any generic wompi keys that the new component still uses (error messages, pay button label).

### Remove dead server functions

These were in `wompi-checkout.tsx` and should already be gone after wompi-0003 rewrite:

- `serverCreateTransaction`
- `serverGetPSEBanks`
- `serverTokenizeCard`
- `serverCreatePaymentSource`

Verify they're not imported anywhere else.

## Definition of Done

- [ ] `tokenizeCard`, `createPaymentSource`, `getWompiPSEBanks` removed from `wompi.ts`
- [ ] Dead types removed from `wompi.ts`
- [ ] `wompi.nequi.*`, `wompi.card.*`, `wompi.pse.*` removed from both locale files
- [ ] No orphaned imports or references to removed functions
- [ ] No TypeScript errors
- [ ] `pnpm check` passes (format/lint specific files if `_profile-settings.tsx` issue)
