---
paths:
  - 'src/components/**/*.tsx'
  - 'src/routes/**/*.tsx'
---

# TanStack Form + Zod

Zod 4 supports Standard Schema natively—no adapter needed.

## Basic Setup

```tsx
import { useForm } from '@tanstack/react-form'
import { z } from '@/lib/validators'

function MyForm() {
  const form = useForm({
    defaultValues: { email: '', name: '' },
    onSubmit: async ({ value }) => {
      console.log(value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      {/* fields */}
    </form>
  )
}
```

## Field with Validation

```tsx
<form.Field
  name="email"
  validators={{
    onChange: z.email('Invalid email'),
    onBlur: z.email('Invalid email'),
  }}
>
  {(field) => (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      {field.state.meta.errors.length > 0 && (
        <FieldError>{field.state.meta.errors.join(', ')}</FieldError>
      )}
    </Field>
  )}
</form.Field>
```

## Form-Level Validation

```tsx
const form = useForm({
  defaultValues: { password: '', confirm: '' },
  validators: {
    onChange: z.object({
      password: z.string().min(8),
      confirm: z.string(),
    }).refine(
      (data) => data.password === data.confirm,
      { message: 'Passwords must match', path: ['confirm'] }
    ),
  },
  onSubmit: async ({ value }) => { ... },
})
```

## Async Validation

```tsx
<form.Field
  name="username"
  validators={{
    onChangeAsync: async ({ value }) => {
      const taken = await checkUsername(value)
      return taken ? 'Username taken' : undefined
    },
    onChangeAsyncDebounceMs: 500,
  }}
>
  {(field) => ...}
</form.Field>
```

## Submit State

```tsx
<form.Subscribe selector={(state) => state.isSubmitting}>
  {(isSubmitting) => (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Saving...' : 'Save'}
    </Button>
  )}
</form.Subscribe>
```
