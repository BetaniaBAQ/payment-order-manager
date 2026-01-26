# Handoff

## Last Completed

**Phase 3 (TASK-3.1-3.13)**: Organizations & Profiles Convex functions

- Created `convex/lib/slug.ts`:
  - `generateSlug()` - URL-friendly slug from string (handles accents, special chars)
  - `makeSlugUnique()` - append numeric suffix if slug exists
- Created `convex/organizations.ts`:
  - `create` - creates org with auto-generated unique slug
  - `getById`, `getByOwner`, `getBySlug` - queries
  - `update` - updates name/slug (owner only)
  - `delete_` - deletes org if no profiles exist (owner only)
- Created `convex/paymentOrderProfiles.ts`:
  - `create` - enforces **one profile per user** constraint
  - `getById`, `getByOwner`, `getByOrganization`, `getBySlug` - queries
  - `update`, `togglePublic`, `updateAllowedEmails` - mutations
  - `delete_` - deletes profile if no orders/tags exist (owner only)

**Note**: TASK-2.14 (useAuth hook) skipped - existing `useUser()` + WorkOS AuthKit routes are sufficient

## Next Task

**TASK-3.6**: Create /orgs/new page (or start Phase 4: Payment Orders)

- UI for creating organizations
- Or proceed to TASK-4.1: paymentOrders.create mutation

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

## Design Constraints

- **One profile per user**: Each user can only own ONE payment order profile (across all organizations). Enforce in `paymentOrderProfiles.create` via `by_owner` index check.

## Pending (optional)

- Custom staging domain (staging.betania.app)
