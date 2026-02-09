# 0026: Pricing toggle component

## Context

Simple monthly/annual billing interval toggle. Shows savings badge on annual option.

## Dependencies

None

## File

`src/components/billing/pricing-toggle.tsx` (new)

## Requirements

**Props:**

```typescript
{
  interval: 'monthly' | 'annual'
  onChange: (interval: 'monthly' | 'annual') => void
}
```

- Two segments: "Mensual" / "Anual"
- "Anual" segment shows badge: "Ahorra 20%"
- Active segment visually highlighted
- Use shadcn Tabs or ToggleGroup

## Resources

- shadcn components: check `src/components/ui/` for available primitives

## Definition of Done

- [ ] Component renders toggle with two options
- [ ] onChange fires with correct interval
- [ ] "Ahorra 20%" badge visible on annual option
- [ ] Active state visually distinct
