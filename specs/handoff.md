# Handoff

## Last Completed

**TASK-2.9**: Create Convex function: users.getOrCreate

- Created `convex/users.ts` with `getOrCreate` mutation
- Searches user by `authKitId` index
- Creates new user if doesn't exist (sets `createdAt`, `updatedAt`)
- Updates `updatedAt` if user exists
- Handles duplicate email with generic error (no user enumeration)
- Validates input with Convex validators
- Created `src/lib/convex-server.ts` for server-side Convex client
- Updated `/api/auth/callback` with `onSuccess` hook to sync users

**Note**: TASK-2.5, 2.6, 2.7 skipped - WorkOS AuthKit handles OTP flow via hosted UI.

## Next Task

**TASK-2.9.1**: Set up Sentry for error tracking

- Full-stack Sentry integration (client, server, Convex)
- Error boundary with fallback UI
- Source maps via Vite plugin
- Add email conflict logging to `users.getOrCreate`
- See `.claude/plans/TASK-2.9.1.implementation.md`

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
```

## Pending (optional)

- Custom staging domain (staging.betania.app)
