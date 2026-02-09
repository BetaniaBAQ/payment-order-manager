# 0027: Wompi checkout component

## Context

Inline payment form for Colombian customers. Renders inside upgrade modal (0028). Supports 3 payment methods via tabs: Nequi (preferred), Card, PSE.

## Dependencies

- 0010 (Wompi client functions)
- 0012 (createCheckoutSession for reference/amount)

## File

`src/components/billing/wompi-checkout.tsx` (new)

## Requirements

**Props:**

```typescript
{
  amountInCents: number
  currency: 'COP'
  reference: string           // from createCheckoutSession
  customerEmail: string
  organizationId: string
  onSuccess: () => void
  onError: (error: string) => void
}
```

**3 tabs (Nequi first as preferred):**

**Nequi tab:**

- Input: phone number (10 digits, starts with 3, Colombian format)
- Button: "Pagar con Nequi"
- Flow: createWompiTransaction with type=NEQUI + phone → show "Aprueba en tu app Nequi" → poll transaction status or wait for webhook
- Loading state while waiting for approval

**Card tab:**

- Inputs: card number, expiry (MM/YY), CVC, cardholder name
- Button: "Pagar con tarjeta"
- Flow: tokenizeCard → createPaymentSource → createWompiTransaction with payment_source_id
- This saves card for recurring (auto-debit next month)
- Show "Tu tarjeta se guardara para pagos futuros" notice

**PSE tab:**

- Dropdown: bank selector (fetch from getWompiPSEBanks on mount)
- Radio: person type (Natural / Juridica)
- Inputs: document type dropdown (CC, NIT, CE, PP), document number
- Button: "Pagar con PSE"
- Flow: createWompiTransaction with type=PSE + bank details → redirect to bank URL
- Show "Seras redirigido a tu banco" notice

All tabs show formatted amount: "$199.000 COP"

## Resources

- [Wompi Payment Methods](https://docs.wompi.co/en/docs/colombia/metodos-de-pago/)
- [Wompi Tokenization](https://docs.wompi.co/en/docs/colombia/fuentes-de-pago/)
- [Wompi PSE Flow](https://docs.wompi.co/en/docs/colombia/metodos-de-pago/) — PSE section

## Definition of Done

- [ ] 3 tabs render: Nequi, Tarjeta, PSE
- [ ] Nequi: phone validation + transaction creation
- [ ] Card: tokenization + payment source + charge
- [ ] PSE: bank list loads, redirect flow works
- [ ] Loading/error states for all tabs
- [ ] Amount displayed formatted
- [ ] onSuccess/onError callbacks fire
