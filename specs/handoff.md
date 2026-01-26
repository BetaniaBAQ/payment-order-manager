# Handoff

## Last Completed

**Organization Memberships**: Multi-user org support with role-based access

- Created `convex/schema/organizationMemberships.ts`:
  - 3 roles: owner, admin, member
  - Indexes: by_organization, by_user, by_organization_and_user
- Created `convex/schema/organizationInvites.ts`:
  - Email-based invites with 7-day expiry
  - Token-based acceptance
- Created `convex/organizationMemberships.ts`:
  - `getByOrganization`, `getByUser`, `getMemberRole` - queries
  - `addMember`, `removeMember`, `updateRole` - mutations
- Created `convex/organizationInvites.ts`:
  - `create` - sends invite email via Resend
  - `getByOrganization`, `getByToken` - queries
  - `accept` - accepts invite, creates membership, sends welcome email
  - `revoke` - cancels pending invite
- Updated `convex/organizations.ts`:
  - `create` now auto-creates owner membership
  - `update` checks admin/owner membership
  - `delete_` cascades to memberships and invites
- Updated `convex/paymentOrderProfiles.ts`:
  - All mutations check membership instead of ownerId

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
