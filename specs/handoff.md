# Handoff

## Last Completed

**TASK-2.9.1**: Set up Sentry for error tracking (client-side)

- Added `@sentry/tanstackstart-react` package
- Client-side Sentry init with TanStack Router integration in `src/router.tsx`
- Error boundary with fallback UI in `src/routes/__root.tsx`
- Source maps via `sentryTanstackStart` Vite plugin
- Added `VITE_SENTRY_DSN` to env schema
- Server-side Sentry deferred to TASK-8.15 (SDK in alpha, Vercel support incomplete)

**Note**: TASK-2.5, 2.6, 2.7 skipped - WorkOS AuthKit handles OTP flow via hosted UI.

## Next Task

**TASK-2.10**: Create Convex function: users.getById

- Query to fetch user by Convex document ID
- See `specs/plan.md` for acceptance criteria

## Environment Variables Required

```bash
# .env.local
VITE_CONVEX_URL=...
CONVEX_DEPLOYMENT=...

# WorkOS AuthKit
WORKOS_API_KEY=sk_...
WORKOS_CLIENT_ID=client_...
WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback
WORKOS_COOKIE_PASSWORD=# 32+ character secret

# Services
UPLOADTHING_TOKEN=...
RESEND_API_KEY=re_...

# Sentry
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=payment-order-manager
SENTRY_AUTH_TOKEN=sntrys_xxx
```

## Pending (optional)

- Custom staging domain (staging.betania.app)
