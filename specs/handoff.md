# Handoff

## Last Completed

**Profile Settings and Tags UI**: TASK-6.5 (partial)

- Created `src/routes/_authenticated/orgs/$slug/profiles/new.tsx`:
  - Form to create new payment order profile
  - Redirects to profile settings on success
- Created `src/routes/_authenticated/orgs/$slug/profiles/$profileSlug.tsx`:
  - ProfileDetailsCard: Edit name, toggle public/private visibility
  - TagsCard: List tags, create/edit/delete via dialog
  - Color picker with 8 preset colors
  - Delete profile with confirmation dialog
- Updated `src/routes/_authenticated/orgs/$slug.tsx`:
  - "Create Profile" button links to `/orgs/$slug/profiles/new`
  - Profile items clickable, navigate to profile settings

## Next Task

**TASK-6.5 (remaining)**: Add file requirements to tags

- File requirements editor in tag dialog
- Usage counter per tag

Or proceed to:

- **TASK-6.6**: TagInput component for selecting tags in payment order forms
- **Phase 4**: Payment Orders (TASK-4.1)

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

- **Profile-scoped tags**: Tags belong to paymentOrderProfiles, not users
- **Single tag per order**: Payment orders have one `tagId` (not array)
- **MIME type validation**: File requirements use precise MIME types

## Pending (optional)

- Custom staging domain (staging.betania.app)
- Slug preview and real-time availability check on /orgs/new
