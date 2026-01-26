# Handoff

## Last Completed

**Organization UI Pages**: TASK-3.6 and TASK-3.7

- Created `src/routes/_authenticated/orgs/new.tsx`:
  - Form to create new organization (TanStack Form + required validation)
  - Redirects to `/orgs/[slug]` on success
  - Loading/error states
- Created `src/routes/_authenticated/orgs/$slug.tsx`:
  - Organization dashboard showing org info and payment order profiles
  - Role badge (owner/admin/member)
  - Settings link for admin+
  - Profile list with public/private badges
- Created `src/routes/_authenticated/orgs/$slug/settings.tsx`:
  - General tab: Edit org name, delete org (owner only with confirmation)
  - Members tab: Table of members with avatar/name/email/role
  - Invite dialog: Email + role selector, sends invite via Resend
  - Role change dropdown (owner only can change roles)
  - Remove member button (admin+ can remove non-owners)
  - Pending invites table

## Next Task

**TASK-3.11**: Create /orgs/$slug/profiles/new page

- UI for creating payment order profiles within an organization
- Form with name, generates slug
- Or proceed to Phase 4: Payment Orders (TASK-4.1)

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
- Slug preview and real-time availability check on /orgs/new
