# Handoff

## Last Completed

**Payment Order Creation Flow**: Full flow for whitelisted users to create payment orders

### Backend (Convex)

- Created `convex/paymentOrders.ts` with:
  - `create` mutation - validates access (owner, org member, or whitelisted), creates order in CREATED status
  - `getByProfile` query - lists orders, whitelisted users see only their own
  - `getById` query - single order with creator and tag data

### Constants

- Created `src/constants/payment-orders.ts`:
  - `CURRENCIES` - COP and USD options
  - `STATUS_CONFIG` - badge variants for all payment order statuses

### UI Components

- Created `src/components/payment-orders/status-badge.tsx` - status badge with color variants
- Created `src/components/payment-orders/order-card.tsx` - displays title, amount, status, date, creator, tag
- Created `src/components/payment-orders/order-list.tsx` - grid of order cards with empty state
- Created `src/components/payment-orders/create-order-dialog.tsx` - form dialog with validation
- Created `src/components/payment-orders/tag-select.tsx` - custom select with color dots

### Profile Page Integration

- Updated `src/routes/_authenticated/orgs/$slug/profiles/$profileSlug/index.tsx`:
  - Added queries for orders and tags
  - Integrated CreateOrderDialog and OrderList components

### Toast Messages

- Updated `src/lib/constants/messages.ts` with `paymentOrder.created` messages

---

## Previously Completed

**Codebase Enhancements**: Code quality, performance, and accessibility improvements

### Phase 1: List Component Improvements

- Added `useMemo` for `filteredItems` in `src/components/shared/list.tsx`
- Added `aria-label` to search input
- Added `aria-hidden="true"` to magnifying glass icon
- Added `aria-live="polite"` region for announcing search results count

### Phase 2: Reusable Components

- Created `src/components/shared/delete-confirm-dialog.tsx` - Standardized delete confirmation dialogs
- Created `src/components/shared/profile-visibility-badge.tsx` - Public/Private badge component
- Created `src/lib/auth.ts` - `isOwnerOrAdmin()` and `canManageResource()` helper functions

### Phase 3: Type Safety

- Replaced `as never` type assertions with proper typed placeholders (`as Id<'organizations'>`, `as Id<'users'>`)
- Updated files: `orgs/$slug/index.tsx`, `profiles/$profileSlug/index.tsx`, `settings.tsx`

### Phase 4: Accessibility

- Updated default page title to "Betania - Payment Order Manager" in `__root.tsx`
- Added skip-to-main-content link in root document
- Added `id="main-content"` to all `<main>` elements across routes

### Phase 5: Loading States

- Created `src/components/shared/page-skeleton.tsx` - `PageSkeleton`, `CardSkeleton`, `ListSkeleton` components
- Added `pendingComponent: PageSkeleton` to dashboard and org index routes

### Phase 6: Custom Hooks

- Created `src/hooks/use-create-edit-dialog.ts` - Generic hook for create/edit dialog state management
- Created `src/components/shared/list-item-link.tsx` - Reusable link component for list items

### Phase 7: Applied Extractions

- Updated `_profile-settings.tsx`, `orgs/$slug/index.tsx`, `profiles/$profileSlug/index.tsx`, `settings.tsx`, `dashboard.tsx`
- Replaced inline AlertDialog patterns with `DeleteConfirmDialog`
- Replaced inline public/private badges with `ProfileVisibilityBadge`
- Replaced manual role checks with `isOwnerOrAdmin()` helper
- Replaced inline Link styling with `ListItemLink` in dashboard and org index
- Updated `src/components/shared/index.ts` with all new component exports

## Next Task

- **TASK-4.4**: Create Convex function: paymentOrders.getByCreator
- **TASK-4.5**: Create Convex function: paymentOrders.updateStatus
- **TASK-4.18**: Create /dashboard/payment-orders/[id] page (order detail view)

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
