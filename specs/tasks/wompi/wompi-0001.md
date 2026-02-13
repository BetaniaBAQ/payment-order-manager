# 0001: Load Wompi Widget + JS scripts

## Context

Add Wompi's two external scripts to the app: the checkout Widget (payment UI) and Wompi JS (fraud prevention fingerprinting). Also add TypeScript declarations for the global objects these scripts expose.

## Dependencies

- None (first task)

## Files

- `src/routes/__root.tsx` (edit — add `<script>` tags to head)
- `src/types/wompi.d.ts` (new — global type declarations)

## Requirements

1. Add both scripts to `RootDocument` `<head>` in `__root.tsx`:

   ```html
   <script src="https://checkout.wompi.co/widget.js" />
   <script
     src="https://wompijs.wompi.com/libs/js/v1.js"
     data-public-key="pub_test_wFoeKqVV0LOo3A87m1yAdzsfUEMM4u0Z"
   />
   ```

   - Public key hardcoded for now (sandbox). Production switch will be handled via env later.
   - Scripts must load before any checkout interaction — `<head>` placement is correct.

2. Create `src/types/wompi.d.ts` with global declarations:

   ```typescript
   interface WompiWidgetConfig {
     currency: 'COP'
     amountInCents: number
     reference: string
     publicKey: string
     signature: { integrity: string }
     redirectUrl?: string
     expirationTime?: string
     taxInCents?: { vat?: number; consumption?: number }
     customerData?: {
       email?: string
       fullName?: string
       phoneNumber?: string
       phoneNumberPrefix?: string
       legalId?: string
       legalIdType?: 'CC' | 'CE' | 'NIT' | 'PP' | 'TI' | 'DNI' | 'RG' | 'OTHER'
     }
     shippingAddress?: {
       addressLine1?: string
       addressLine2?: string
       city?: string
       region?: string
       country?: string
       phoneNumber?: string
       name?: string
       postalCode?: string
     }
   }

   interface WompiTransaction {
     id: string
     status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING'
     reference: string
     amountInCents: number
     currency: string
     paymentMethodType: string
   }

   declare class WidgetCheckout {
     constructor(config: WompiWidgetConfig)
     open(callback: (result: { transaction: WompiTransaction }) => void): void
   }

   declare const $wompi: {
     initialize(
       callback: (
         data: { sessionId: string; deviceData: { deviceID: string } },
         error: unknown,
       ) => void,
     ): void
   }
   ```

3. Verify `tsconfig.json` includes `src/types` in `include` or the declarations are picked up automatically.

## Definition of Done

- [ ] Both `<script>` tags present in `__root.tsx` head
- [ ] `src/types/wompi.d.ts` created with `WidgetCheckout`, `$wompi`, and all config types
- [ ] No TypeScript errors
- [ ] `WidgetCheckout` and `$wompi` are recognized globally without imports
