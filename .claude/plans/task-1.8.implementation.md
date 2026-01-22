# TASK-1.8: Configure TanStack Form with Zod

## Summary

Set up TanStack Form with Zod validation adapter, DevTools integration, and validators folder.

## Dependencies

```bash
pnpm add @tanstack/react-form @tanstack/zod-form-adapter zod
pnpm add -D @tanstack/react-form-devtools
```

## Changes

### 1. `src/lib/validators/index.ts` (NEW)

- Export common Zod schemas (email, required string, etc.)
- Re-export zod for convenience

### 2. `src/lib/form.ts` (NEW)

- Configure formOptions with Zod validator adapter
- Export typed useAppForm hook wrapper

### 3. `src/routes/__root.tsx` (MODIFY)

- Import `TanStackFormDevtoolsPanel` from `@tanstack/react-form-devtools`
- Add as plugin to TanStackDevtools (alongside Router and Query)

```tsx
plugins={[
  { name: 'TanStack Form', render: <TanStackFormDevtoolsPanel /> },
  { name: 'TanStack Query', render: <ReactQueryDevtoolsPanel /> },
  { name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> },
]}
```

### 4. Example usage pattern

```tsx
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

const form = useForm({
  defaultValues: { email: '' },
  validatorAdapter: zodValidator(),
  onSubmit: async ({ value }) => { /* handle */ }
})

<form.Field
  name="email"
  validators={{ onChange: z.string().email() }}
>
  {(field) => (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )}
</form.Field>
```

## Files to Create/Modify

| File                          | Action                             |
| ----------------------------- | ---------------------------------- |
| `src/lib/validators/index.ts` | NEW - Common Zod schemas           |
| `src/lib/form.ts`             | NEW - Form config with Zod adapter |
| `src/routes/__root.tsx`       | MODIFY - Add Form DevTools plugin  |

## Verification

1. `pnpm dev` starts without errors
2. TanStack DevTools shows "TanStack Form" tab
3. Import `{ z }` from validators works
4. Import form utilities works
5. TypeScript infers types from Zod schemas (hover in IDE)
