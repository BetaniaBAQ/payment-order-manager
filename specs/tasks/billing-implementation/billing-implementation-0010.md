# 0010: Wompi client setup

## Context

API client for Wompi (Bancolombia payment gateway). Handles transactions, card tokenization, PSE bank list, payment sources, and webhook signature verification. Colombia primary payment provider.

## Dependencies

None

## File

`src/lib/wompi.ts` (new)

## Environment Variables

Add to `.env.local`:

```bash
WOMPI_PUBLIC_KEY=pub_test_xxx              # frontend + tokenization
WOMPI_PRIVATE_KEY=prv_test_xxx             # backend API calls
WOMPI_EVENTS_SECRET=test_events_xxx        # webhook signature
WOMPI_INTEGRITY_SECRET=test_integrity_xxx  # transaction integrity hash
```

## Requirements

Base URL: `https://sandbox.wompi.co/v1` (test) / `https://production.wompi.co/v1` (prod). Switch via `NODE_ENV`.

**5 exported functions:**

1. `createWompiTransaction({ amountInCents, currency, customerEmail, reference, paymentMethod, redirectUrl, paymentSourceId? })` — `POST /transactions`, auth: Bearer PRIVATE_KEY
2. `getWompiPSEBanks()` — `GET /pse/financial_institutions`, auth: Bearer PUBLIC_KEY. Returns list of `{ financial_institution_code, financial_institution_name }`
3. `tokenizeCard({ number, cvc, expMonth, expYear, cardHolder })` — `POST /tokens/cards`, auth: Bearer PUBLIC_KEY. Returns `{ data: { id: "tok_xxx" } }`
4. `createPaymentSource({ type, token, customerEmail, acceptanceToken })` — `POST /payment_sources`, auth: Bearer PRIVATE_KEY. Returns `{ data: { id: 12345 } }`
5. `verifyWompiSignature({ transactionId, status, amountInCents, timestamp, signature })` — SHA256(`${transactionId}${status}${amountInCents}${timestamp}${EVENTS_SECRET}`) === signature

All API functions use `fetch`, return parsed JSON. Add proper TypeScript types for params and responses.

## Resources

- [Wompi API Docs](https://docs.wompi.co/en/docs/colombia/)
- [Wompi Payment Methods](https://docs.wompi.co/en/docs/colombia/metodos-de-pago/)
- [Wompi Tokenization](https://docs.wompi.co/en/docs/colombia/fuentes-de-pago/)
- [Wompi Sandbox Test Data](https://docs.wompi.co/en/docs/colombia/datos-de-prueba-en-sandbox/)
- Test card approved: `4242 4242 4242 4242`
- Test card declined: `4111 1111 1111 1111`
- Test PSE bank rejected: "Banco que rechaza"

## Definition of Done

- [ ] File exists at `src/lib/wompi.ts`
- [ ] All 5 functions exported with TypeScript types
- [ ] Sandbox/prod URL switching works
- [ ] Signature verification uses SHA256 correctly
- [ ] Env vars documented in `.env.example` (if exists)
