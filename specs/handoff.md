# Handoff

## Last Completed

**Profile Settings and Tags UI**: TASK-6.5 (mostly complete)

- Fixed routing structure for profile pages:
  - Moved `$slug.tsx` → `$slug/index.tsx` (org page as index route)
  - Created `$profileSlug/index.tsx` (profile view page)
  - Created `$profileSlug/settings.tsx` (profile settings page)
- Created `src/components/dashboard/settings-button.tsx`:
  - Reusable gear icon button with tooltip
  - Accepts `size` prop ('small' | 'large')
  - Links to org settings or profile settings based on `profileSlug` prop
- Profile settings page (`/orgs/$slug/profiles/$profileSlug/settings`):
  - ProfileDetailsCard: Edit name, toggle public/private, delete profile
  - TagsCard: List tags, create/edit/delete via TagDialog
  - Color picker with 8 preset colors
  - Toast notifications for CRUD operations
- All Convex tag functions complete (TASK-6.1-6.4)

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
