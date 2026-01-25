# Handoff

## Last Completed

**TASK-2.10**: Create Convex function: users.getById

- Added `getById` query in `convex/users.ts`
- Uses `ctx.db.get()` for direct ID lookup
- Returns `null` if not found or soft-deleted (`deletedAt` set)

## Next Task

**TASK-2.11**: Create Convex function: users.getByEmail

- Query to fetch user by email using `by_email` index
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
