---
paths:
  - 'src/routes/**/*.tsx'
  - 'src/routes/**/*.ts'
---

# TanStack Router

- Routes are file-based in `src/routes/`
- Use `createFileRoute` for route definitions
- Leverage loader functions for data fetching
- Use type-safe `Link` component for navigation
- Route params are typed automatically from the filename

# API Routes (Server Handlers)

API routes use `createFileRoute` with `server.handlers` - NOT Nitro/h3 directly.

- Place API routes in `src/routes/api/` as `.ts` files
- Use `server.handlers` object with HTTP method keys (GET, POST, etc.)
- Handlers receive `{ request }` and return `Response` objects
- Path alias `@/` works normally in API routes

```typescript
// src/routes/api/example.ts
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/example')({
  server: {
    handlers: {
      GET: ({ request }) => {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
      POST: async ({ request }) => {
        const body = await request.json()
        return new Response(JSON.stringify({ received: body }))
      },
    },
  },
})
```
