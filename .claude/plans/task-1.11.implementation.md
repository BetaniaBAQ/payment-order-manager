# TASK-1.11: Configure @t3-oss/env for environment variables

## Summary

Set up type-safe environment variables with Zod validation using @t3-oss/env-core.

## Dependencies

```bash
pnpm add @t3-oss/env-core
```

## Changes

### 1. `src/lib/env.ts` (NEW)

- Create env config with server and client variables
- Server: NODE_ENV, CONVEX_DEPLOYMENT, WorkOS, Resend, UploadThing (optional for now)
- Client: VITE_CONVEX_URL (required)
- Zod validation with descriptive errors

### 2. `src/router.tsx` (MODIFIED)

- Import `env` from `@/lib/env`
- Replace `import.meta.env.VITE_CONVEX_URL` with `env.VITE_CONVEX_URL`
- Remove manual null check (handled by env validation)

### 3. `.env.example` (NEW)

- Document all environment variables with placeholders
- Organized by service/phase

## Files

| File             | Action                     |
| ---------------- | -------------------------- |
| `src/lib/env.ts` | NEW - Type-safe env config |
| `src/router.tsx` | MODIFIED - Use env utility |
| `.env.example`   | NEW - Variable template    |

## Verification

1. `pnpm tsc --noEmit` passes
2. `pnpm check` passes
3. Missing required env throws descriptive error
4. TypeScript infers `env.VITE_CONVEX_URL` as string
