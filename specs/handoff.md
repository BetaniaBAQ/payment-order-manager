# Handoff

## Last Completed

**TASK-2.1, 2.2, 2.3**: WorkOS AuthKit Setup

- WorkOS account configured with AuthKit enabled
- OTP authentication method configured
- Installed `@workos/authkit-tanstack-react-start` SDK
- Created callback route at `src/routes/api/auth/callback.ts`
- Updated `src/lib/env.ts` with WorkOS variables

## Next Task

**TASK-2.4**: Create /auth/login route with email form

- Update existing stub at `src/routes/auth/login.tsx`
- Add TanStack Form with email validation
- Integrate with WorkOS sign-in flow

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
