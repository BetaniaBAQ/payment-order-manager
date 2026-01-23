# TASK-2.9.1: Set up Sentry for error tracking

## Summary

Full-stack Sentry integration for client, server, and Convex error tracking with source maps.

## Dependencies

- TASK-2.9 (users.getOrCreate mutation)

## Changes

### Install

```bash
pnpm add @sentry/react @sentry/node @sentry/vite-plugin
```

### New Files

1. **`src/lib/sentry.client.ts`** - Client-side Sentry init

   ```typescript
   import * as Sentry from '@sentry/react'

   export function initSentry() {
     if (typeof window === 'undefined') return

     Sentry.init({
       dsn: import.meta.env.VITE_SENTRY_DSN,
       environment: import.meta.env.MODE,
       integrations: [
         Sentry.browserTracingIntegration(),
         Sentry.replayIntegration(),
       ],
       tracesSampleRate: 1.0,
       replaysSessionSampleRate: 0.1,
       replaysOnErrorSampleRate: 1.0,
     })
   }

   export { Sentry }
   ```

2. **`src/lib/sentry.server.ts`** - Server-side Sentry init

   ```typescript
   import * as Sentry from '@sentry/node'

   export function initSentry() {
     Sentry.init({
       dsn: process.env.VITE_SENTRY_DSN,
       environment: process.env.NODE_ENV,
       tracesSampleRate: 1.0,
     })
   }

   export { Sentry }
   ```

3. **`convex/lib/sentry.ts`** - Convex Sentry init

   ```typescript
   import * as Sentry from '@sentry/node'

   const dsn = process.env.SENTRY_DSN

   if (dsn) {
     Sentry.init({
       dsn,
       environment: process.env.CONVEX_CLOUD_URL?.includes('dev')
         ? 'development'
         : 'production',
     })
   }

   export { Sentry }
   ```

4. **`src/components/error-boundary.tsx`** - Error fallback UI
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

### Modified Files

5. **`src/router.tsx`** - Init client Sentry

   ```typescript
   import { initSentry } from './lib/sentry.client'

   // At top of getRouter()
   if (typeof window !== 'undefined') {
     initSentry()
   }
   ```

6. **`src/routes/__root.tsx`** - Add error boundary

   ```typescript
   import * as Sentry from '@sentry/react'
   import { ErrorFallback } from '@/components/error-boundary'

   // Wrap children in RootDocument
   <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
     {children}
   </Sentry.ErrorBoundary>
   ```

7. **`vite.config.ts`** - Source map uploads

   ```typescript
   import { sentryVitePlugin } from '@sentry/vite-plugin'

   export default defineConfig({
     build: { sourcemap: true },
     plugins: [
       // ... existing plugins
       sentryVitePlugin({
         org: process.env.SENTRY_ORG,
         project: process.env.SENTRY_PROJECT,
         authToken: process.env.SENTRY_AUTH_TOKEN,
       }),
     ],
   })
   ```

8. **`convex/users.ts`** - Add Sentry logging to email conflict

   ```typescript
   import { Sentry } from './lib/sentry'

   // In emailConflict block:
   Sentry.captureMessage('Account creation blocked - email conflict', {
     level: 'warning',
     extra: { authKitId: args.authKitId, existingUserId: emailConflict._id },
   })
   ```

## Files

| Action | Path                                |
| ------ | ----------------------------------- |
| Create | `src/lib/sentry.client.ts`          |
| Create | `src/lib/sentry.server.ts`          |
| Create | `convex/lib/sentry.ts`              |
| Create | `src/components/error-boundary.tsx` |
| Modify | `src/router.tsx`                    |
| Modify | `src/routes/__root.tsx`             |
| Modify | `vite.config.ts`                    |
| Modify | `convex/users.ts`                   |

## Environment Variables

**Local `.env.local`:**

```bash
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=payment-order-manager
SENTRY_AUTH_TOKEN=sntrys_xxx
```

**Convex dashboard:**

- `SENTRY_DSN` - Sentry project DSN

## Questions

None.
