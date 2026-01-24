# TASK-2.9.1: Set up Sentry for error tracking (client-side)

## Summary

Client-side Sentry integration for TanStack Start using `@sentry/tanstackstart-react` SDK.

> **Note:** Server-side Sentry deferred to future task - SDK still in alpha, Vercel support incomplete.
> See [GitHub discussion](https://github.com/getsentry/sentry-javascript/discussions/18356).

## Questions (for user)

None - ready to implement.

## Dependencies

- TASK-2.9 (users.getOrCreate mutation)

---

## 1. Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and create account/login
2. Create new project → Select "TanStack Start" or "React" as platform
3. Note the **DSN** from project settings (Settings → Client Keys)
4. Create auth token for source maps: Settings → Auth Tokens → Create New Token
   - Scope: `project:releases`, `org:read`

## 2. Add Environment Variables

**`.env.local`:**

```bash
# Sentry
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=payment-order-manager
SENTRY_AUTH_TOKEN=sntrys_xxx
```

**`.env.example`** (add):

```bash
# Sentry
VITE_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

## 3. Update Env Schema

**`src/lib/env.ts`** - Add to client section:

```typescript
client: {
  VITE_CONVEX_URL: z.url(),
  VITE_SENTRY_DSN: z.string().url(),
},

runtimeEnv: {
  // ... existing
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
},
```

## 4. Install Dependencies

```bash
pnpm add @sentry/tanstackstart-react
```

## 5. Initialize Client-Side Sentry

**`src/router.tsx`** - Add after router creation:

```typescript
import * as Sentry from '@sentry/tanstackstart-react'

import { env } from './lib/env'

// After: const router = createRouter({ ... })
if (!router.isServer) {
  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: env.NODE_ENV,
    integrations: [
      Sentry.tanstackRouterBrowserTracingIntegration(router),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
}
```

## 6. Add Error Boundary

**`src/components/error-boundary.tsx`** (create):

```typescript
export function ErrorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground mt-2">
          We've been notified and are working on a fix.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 underline"
        >
          Reload page
        </button>
      </div>
    </div>
  )
}
```

**`src/routes/__root.tsx`** - Wrap app with error boundary:

```typescript
import * as Sentry from '@sentry/tanstackstart-react'
import { ErrorFallback } from '@/components/error-boundary'

// In RootDocument, wrap children:
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  {children}
</Sentry.ErrorBoundary>
```

## 7. Configure Source Maps (Production)

**`vite.config.ts`:**

```typescript
import { sentryTanstackStart } from '@sentry/tanstackstart-react'

export default defineConfig({
  build: { sourcemap: true },
  plugins: [
    // ... existing plugins
    sentryTanstackStart({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
})
```

---

## Files Summary

| Action | Path                                |
| ------ | ----------------------------------- |
| Modify | `.env.local`                        |
| Modify | `.env.example`                      |
| Modify | `src/lib/env.ts`                    |
| Modify | `src/router.tsx`                    |
| Create | `src/components/error-boundary.tsx` |
| Modify | `src/routes/__root.tsx`             |
| Modify | `vite.config.ts`                    |

## Follow-up Task

**TASK-8.15: Add Sentry server-side tracking** - added to `specs/plan.md` for when SDK stabilizes.
