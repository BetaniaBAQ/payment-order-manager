---
paths:
  - 'src/components/**/*.tsx'
  - 'src/routes/**/*.tsx'
---

# TanStack Form + Zod

Zod 4 supports Standard Schema natively—no adapter needed.

## Form Field Components (Preferred)

Use reusable form field components instead of raw `form.Field`:

```tsx
import {
  Form,
  FormInput,
  FormSelect,
  FormSubmitButton,
  FormSwitch,
  FormTextarea,
} from '@/components/forms'
import { useForm } from '@/lib/form'
import { email, requiredString } from '@/lib/validators'

function MyForm() {
  const form = useForm({
    defaultValues: { name: '', email: '', role: '', bio: '', isPublic: false },
    onSubmit: async ({ value }) => {
      /* ... */
    },
  })

  return (
    <Form onSubmit={form.handleSubmit}>
      <FormInput
        form={form}
        name="name" // ← autocomplete from defaultValues
        label="Name"
        validator={requiredString}
      />
      <FormInput
        form={form}
        name="email"
        label="Email"
        type="email"
        validator={email}
      />
      <FormSelect
        form={form}
        name="role"
        label="Role"
        placeholder="Select a role"
        options={[
          { value: 'member', label: 'Member' },
          { value: 'admin', label: 'Admin' },
        ]}
      />
      <FormTextarea form={form} name="bio" label="Bio" rows={4} />
      <FormSwitch
        form={form}
        name="isPublic"
        label="Public Profile"
        description="Anyone can view your profile"
      />
      <FormSubmitButton form={form} label="Save" loadingLabel="Saving..." />
    </Form>
  )
}
```

### Available Components

| Component          | Use Case                      | Key Props                          |
| ------------------ | ----------------------------- | ---------------------------------- |
| `FormInput`        | Text, email, password, number | `type`, `validator`, `placeholder` |
| `FormTextarea`     | Multi-line text               | `rows`, `validator`                |
| `FormSelect`       | Dropdown selection            | `options`, `placeholder`           |
| `FormSwitch`       | Boolean toggle                | `description`                      |
| `FormSubmitButton` | Submit with loading state     | `label`, `loadingLabel`            |
| `Form`             | Form wrapper                  | `onSubmit`                         |

### Type Safety

The `name` prop provides autocomplete based on form's `defaultValues`:

```tsx
const form = useForm({
  defaultValues: { firstName: '', lastName: '' },
})

<FormInput form={form} name="firstName" />  // ✓ autocomplete works
<FormInput form={form} name="invalid" />    // ✗ type error
```

## Raw Field Pattern (Advanced)

For custom field types not covered by form components:

```tsx
<form.Field name="customField" validators={{ onChange: z.string() }}>
  {(field) => (
    <Field>
      <FieldLabel>Custom</FieldLabel>
      <FieldContent>
        <MyCustomInput
          value={field.state.value}
          onChange={(v) => field.handleChange(v)}
          onBlur={field.handleBlur}
        />
        <FieldError errors={field.state.meta.errors} />
      </FieldContent>
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
