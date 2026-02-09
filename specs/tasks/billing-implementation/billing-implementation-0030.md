# 0030: Usage meters component

## Context

Progress bars showing current usage vs tier limits. Used in billing settings (0029).

## Dependencies

- 0009 (getByOrganization return type)

## File

`src/components/billing/usage-meters.tsx` (new)

## Requirements

**Props:**

```typescript
{
  usage: {
    orders: number
    storageMB: number
    emails: number
  }
  limits: TierLimits // from tierLimits.ts
}
```

**3 meters:**

1. "Ordenes este mes" — usage.orders / limits.orders
2. "Almacenamiento" — usage.storageMB / limits.storageMB (show in GB if > 1024 MB)
3. "Emails este mes" — usage.emails / limits.emails

**Each meter:**

- Label + "X / Y" (or "X / Ilimitado" if Infinity)
- shadcn Progress bar
- Color based on percentage:
  - < 60%: default (neutral)
  - 60-80%: yellow/warning
  - \> 80%: red/destructive
- If limit=Infinity: show "Ilimitado", no progress bar (just the label)

## Resources

- shadcn Progress: check if exists in `src/components/ui/`, add via `pnpm dlx shadcn@latest add progress` if not

## Definition of Done

- [ ] 3 meters rendered
- [ ] Correct percentage calculation
- [ ] Color changes at 60% and 80% thresholds
- [ ] Infinity handled (show "Ilimitado")
- [ ] Storage formatted: MB when < 1 GB, GB otherwise
- [ ] Progress component available (add if missing)
