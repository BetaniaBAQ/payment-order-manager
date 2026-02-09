# 0013: Wompi webhook API route

## Context

TanStack Start API route receiving Wompi event notifications. Wompi sends POST to this URL when transaction status changes. Must verify signature and forward to Convex mutation.

## Dependencies

- 0010 (verifyWompiSignature from wompi.ts)
- 0015 (handleWompiEvent mutation must exist in Convex — can stub first)

## File

`src/routes/api/webhooks/wompi.ts` (new)

## Requirements

POST handler:

1. Parse JSON body
2. Extract: `body.data.transaction.{id, status, amount_in_cents, payment_method_type}`, `body.signature.checksum`, `body.timestamp`, `body.data.transaction.reference`
3. Verify signature via `verifyWompiSignature()` — return 401 if invalid
4. Instantiate `ConvexHttpClient(process.env.CONVEX_URL)`
5. Call `convex.mutation(api.subscriptions.handleWompiEvent, { reference, status, transactionId, paymentMethod, amountInCents })`
6. Return 200 `{ ok: true }`

Wompi statuses: `APPROVED`, `DECLINED`, `VOIDED`, `ERROR`

**Wompi webhook payload structure:**

```json
{
  "event": "transaction.updated",
  "data": {
    "transaction": {
      "id": "123-abc",
      "status": "APPROVED",
      "amount_in_cents": 19900000,
      "reference": "sub_orgId_pro_1234567890",
      "payment_method_type": "NEQUI"
    }
  },
  "signature": { "checksum": "sha256hash..." },
  "timestamp": 1234567890
}
```

## Resources

- [Wompi Events/Webhooks](https://docs.wompi.co/en/docs/colombia/eventos/)
- Existing API route pattern: `src/routes/api/auth/callback.ts`, `src/routes/api/uploadthing.ts`
- `CONVEX_URL` env var (already exists in project)

## Definition of Done

- [ ] File exists at `src/routes/api/webhooks/wompi.ts`
- [ ] POST handler exported
- [ ] Signature verified before processing
- [ ] 401 returned on invalid signature
- [ ] Calls Convex mutation with correct args
- [ ] Configure webhook URL in Wompi dashboard: `https://{domain}/api/webhooks/wompi`
