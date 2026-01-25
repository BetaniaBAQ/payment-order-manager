# Handoff

## Last Completed

**TASK-2.12**: Create Convex function: users.update

- Added `update` mutation in `convex/users.ts`
- Updates `name` and/or `avatarUrl` fields
- Validates user exists and not soft-deleted
- Validates caller is the user being updated (via authKitId)
- Updates `updatedAt` timestamp
- Returns updated user document

## Next Task

**TASK-2.13**: Create Convex function: users.getCurrentUser

- Query to get current user based on authKitId
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
