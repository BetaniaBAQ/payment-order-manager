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

## Next Tasks

### Priority 1: Payment Order Workflow (Phase 4)

Core workflow functionality needed to complete the payment order system:

| Task          | Description                                                   | Depends On    |
| ------------- | ------------------------------------------------------------- | ------------- |
| **TASK-4.5**  | `paymentOrders.updateStatus` mutation with state transitions  | -             |
| **TASK-4.7**  | `paymentOrderHistory.create` mutation                         | -             |
| **TASK-4.8**  | `paymentOrderHistory.getByPaymentOrder` query                 | TASK-4.7      |
| **TASK-4.18** | `/dashboard/payment-orders/$id` detail page                   | TASK-4.5, 4.8 |
| **TASK-4.19** | `PaymentOrderTimeline` component                              | TASK-4.8      |
| **TASK-4.21** | `PaymentOrderActions` component (approve/reject/request docs) | TASK-4.5      |

### Priority 2: Documents & Files (Phase 4)

Enable file attachments for payment orders:

| Task          | Description                                     |
| ------------- | ----------------------------------------------- |
| **TASK-4.9**  | `paymentOrderDocuments.create` mutation         |
| **TASK-4.10** | `paymentOrderDocuments.getByPaymentOrder` query |
| **TASK-4.11** | `paymentOrderDocuments.delete` mutation         |
| **TASK-4.14** | `FileUploader` component                        |
| **TASK-4.20** | `PaymentOrderDocumentsList` component           |

### Priority 3: Action Modals (Phase 4)

UI for status change actions:

| Task          | Description                                          |
| ------------- | ---------------------------------------------------- |
| **TASK-4.22** | `RequestSupportModal` - request additional documents |
| **TASK-4.23** | `RejectPaymentOrderModal` - reject with reason       |
| **TASK-4.24** | `ApprovePaymentOrderModal` - approve order           |

### Priority 4: Search & Filtering (Phase 4 + 6)

| Task          | Description                                          |
| ------------- | ---------------------------------------------------- |
| **TASK-4.27** | `paymentOrders.search` with full-text search         |
| **TASK-6.8**  | Full-text search index on title, description, reason |
| **TASK-6.9**  | `FilterPanel` component                              |

### Backlog

**Phase 3 gaps:**

- TASK-3.8: `paymentOrderProfiles.create` mutation (profile creation from UI)
- TASK-3.14: `/orgs/$slug/profiles/new` page

**Phase 5 (Email):**

- All tasks (TASK-5.1 to 5.15) - not started

**Phase 7 (GDPR):**

- TASK-7.3: `users.exportData`
- TASK-7.4: `users.deleteAccount`

**Phase 8 (Testing):**

- All tasks - not started

## Progress Summary

| Phase   | Description         | Status        |
| ------- | ------------------- | ------------- |
| Phase 1 | Base Setup          | ~95% complete |
| Phase 2 | Authentication      | ~70% complete |
| Phase 3 | Orgs & Profiles     | ~60% complete |
| Phase 4 | Payment Orders      | ~10% complete |
| Phase 5 | Email Notifications | ~3% complete  |
| Phase 6 | Tags & Reports      | ~30% complete |
| Phase 7 | GDPR Compliance     | ~15% complete |
| Phase 8 | Testing & Deploy    | ~5% complete  |

See `specs/plan.md` for detailed task-by-task status.

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
