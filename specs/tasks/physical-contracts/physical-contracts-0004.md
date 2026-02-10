# 0004: Billing settings — handle `paymentProvider: 'physical_contract'`

## Context

`billing-settings.tsx` currently handles `stripe` and `wompi` providers but has no case for `'physical_contract'`. Physical clients see an empty "Método de pago" card, a misleading "Próximo cobro" date, and an upgrade button they shouldn't use. Fix all three.

## Dependencies

- 0002 (assignTier creates subs with `paymentProvider: 'physical_contract'`)

## File

`src/components/billing/billing-settings.tsx` (modify)

## Requirements

1. Add derived boolean after existing `isStripe`/`isWompi`:

```typescript
const isPhysical = subscription?.paymentProvider === 'physical_contract'
```

2. **"Método de pago" card** — add `isPhysical` case:

```tsx
{
  isPhysical && (
    <p className="text-sm">Contrato físico (administrado manualmente)</p>
  )
}
```

3. **"Próximo cobro"** — hide when `isPhysical`:

Change `{subscription && !isFree && (` to `{subscription && !isFree && !isPhysical && (`

4. **"Acciones" card** — hide upgrade button when `isPhysical`:

Change `<Button onClick={() => setUpgradeOpen(true)}>` block to:

```tsx
{
  !isPhysical && (
    <Button onClick={() => setUpgradeOpen(true)}>
      {isFree ? 'Elegir un plan' : 'Mejorar plan'}
    </Button>
  )
}
```

5. Hide Stripe portal button when `isPhysical` (already guarded by `isStripe`, but be explicit).

## No-gos

- No "contact admin" link or messaging — just label it as manually managed
- No cancel/downgrade UI for physical clients — admin handles it

## Definition of Done

- [ ] Physical client sees "Contrato físico (administrado manualmente)" in payment method card
- [ ] No "Próximo cobro" date shown for physical clients
- [ ] No upgrade/manage billing buttons for physical clients
- [ ] Plan badge and usage meters still display correctly
- [ ] Existing Stripe/Wompi flows unaffected
- [ ] No TypeScript errors
