---
paths:
  - 'src/**/*.ts'
  - 'src/**/*.tsx'
---

# Zod v4 Validation

Import from `@/lib/validators` for common schemas and `z`:

```ts
import { email, requiredString, z } from '@/lib/validators'
```

## Zod v4 API Changes

Zod 4 has top-level schema functions. Prefer these over chained methods:

```ts
// ✅ Zod 4 style
z.email()
z.uuid()
z.url()
z.iso.date()

// ❌ Deprecated (still works but shows warnings)
z.string().email()
z.string().uuid()
```

## Common Patterns

```ts
// Required string
z.string().min(1, 'Required')

// Optional with default
z.string().optional().default('')

// Email (Zod 4)
z.email('Invalid email')

// Number constraints
z.number().positive().int()

// Object schema
z.object({
  name: z.string().min(1),
  email: z.email(),
  age: z.number().optional(),
})

// Array
z.array(z.string()).min(1)
```

## Type Inference

```ts
const schema = z.object({ name: z.string() })
type FormData = z.infer<typeof schema>
```
