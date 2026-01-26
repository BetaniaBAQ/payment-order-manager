# Handoff

## Last Completed

**TASK-6.1-6.4**: Profile-scoped tags with file requirements

- Redesigned tags to be **profile-scoped** (owned by `paymentOrderProfiles`)
- Updated `convex/schema/tags.ts`:
  - Changed `userId` → `profileId`
  - Added `fileRequirements` array (label, allowedMimeTypes, maxFileSizeMB, required)
  - Added `description`, `updatedAt` fields
  - Updated indexes: `by_profile`, `by_profile_and_name`
- Updated `convex/schema/orders.ts`:
  - Changed `tagIds: v.array(...)` → `tagId: v.optional(...)`
  - Added `by_tag` index
- Created `convex/tags.ts` with CRUD:
  - `tags.create` - profile owner creates tag with optional file requirements
  - `tags.getById` - get single tag
  - `tags.getByProfile` - list profile's tags (alphabetically)
  - `tags.update` - update tag (owner only)
  - `tags.delete_` - delete tag, clears from orders (owner only)

## Next Task

**TASK-6.5**: Create tag management UI

- Tag management within profile settings (`/orgs/$orgSlug/profiles/$profileSlug`)
- File requirements editor component
- See `specs/plan.md` for acceptance criteria

**Alternative**: Continue with **TASK-2.14** (useAuth hook) if auth completion is priority

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
