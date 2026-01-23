# Handoff

## Last Completed

**TASK-2.4**: Set up route guards with WorkOS AuthKit

- Created `src/start.ts` with AuthKit middleware
- Created `src/routes/_authenticated.tsx` layout guard
- Created `src/routes/logout.tsx` logout handler
- Created `src/routes/_authenticated/dashboard.tsx` protected dashboard
- Updated landing page to link to `/dashboard`
- Removed `/auth/login` stub (WorkOS handles login UI)
- Created `.claude/rules/authkit.md` with integration patterns

**Note**: TASK-2.5, 2.6, 2.7 are not needed - WorkOS AuthKit handles OTP flow via hosted UI.

## Next Task

**TASK-2.9**: Create Convex function: users.getOrCreate

- Mutation to get or create user in Convex
- Search user by `authKitId`
- Create new user if doesn't exist
- Update `updatedAt` if exists
- Validate input with Zod

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
