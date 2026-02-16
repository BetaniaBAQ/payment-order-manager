# Handoff

## Last Completed

**UI Phase 2 — Sidebar Navigation**

Replaced header-based navigation with a sidebar for all authenticated pages.

### New Files

- `src/components/shared/app-sidebar.tsx` — Sidebar with org switcher, profiles list, settings link, user menu (language, theme, sign out)
- `src/components/shared/page-header.tsx` — Lightweight page title + description + actions slot

### Modified Files

- `src/routes/_authenticated.tsx` — Wrapped Outlet with SidebarProvider + AppSidebar + SidebarInset, parallel prefetch of org memberships
- 6 route files — Removed AppHeader/outer wrappers, use PageHeader component
- `src/i18n/locales/{en,es}/common.json` — Added sidebar.\* i18n keys
- `src/components/shared/index.ts` — Removed AppHeader export
- `src/lib/constants/navigation.ts` — Removed HOME_BREADCRUMB

### Deleted Files

- `src/components/shared/app-header.tsx`
- `src/components/shared/org-breadcrumb-chooser.tsx`
- `src/components/shared/preferences-dropdown.tsx`

### Key Patterns

- base-nova shadcn uses `render` prop (NOT `asChild`) for component composition
- Sidebar extracts org slug from pathname via regex (pathless layout has no route params)
- Suspense boundaries wrap org-dependent sidebar sections

---

## Previously Completed

**Wompi Integration (wompi-0001 through wompi-0007)**

Replaced custom PCI-violating checkout with official Wompi Widget. All 7 tasks complete.

### Changes

- **wompi-0001**: Loaded Widget + JS scripts in `__root.tsx`, added global types in `src/types/wompi.d.ts`
- **wompi-0002**: Added `generateIntegritySignature()` in `src/lib/wompi.ts`
- **wompi-0003**: Rewrote `WompiCheckout` to use `WidgetCheckout`, added IVA tax breakdown (`calculateCopTaxBreakdown`), success view in `UpgradeModal`
- **wompi-0004**: Fixed webhook signature verification to use dynamic `signature.properties`
- **wompi-0005**: Created `useWompiSession` hook for fraud prevention fingerprinting
- **wompi-0006**: Removed dead code (`tokenizeCard`, `createPaymentSource`, `getWompiPSEBanks`) and dead i18n keys
- **wompi-0007**: Implemented `chargeWompiSubscription` internalAction + `markPastDueAndNotify` internalMutation

### Environment Variables Required

- `WOMPI_PUBLIC_KEY` — in `.env.local` (used by server functions)
- `WOMPI_PRIVATE_KEY` — in `.env.local` AND Convex dashboard (used by recurring billing)
- `WOMPI_EVENTS_SECRET` — in `.env.local` (webhook verification)
- `WOMPI_INTEGRITY_SECRET` — in `.env.local` (integrity signature)

---

## Previously Completed

**i18n-0014: Translate route pages**

Translated all 12+ route files to use `t()` from react-i18next. All hardcoded English/Spanish strings replaced with translation keys across namespaces (common, settings, orders, billing).

### Key files translated

- `__root.tsx` — dynamic `lang={i18n.language}`, skip-to-content
- `dashboard.tsx`, `orgs/new.tsx`, `orgs/$slug/index.tsx`, `orgs/$slug/settings.tsx`
- `profiles/$profileSlug/index.tsx`, `orders/$orderId.tsx`
- `_profile-settings.tsx` — 50+ strings (tags, uploads, dialogs)
- `_profile-settings/details.tsx`
- `admin/subscriptions.tsx`, `index.tsx` (landing), `pricing.tsx`

### Translation files updated

- Added `landing.*`, `pricingPage.*`, `admin.*`, `detail.profileDescription` keys
- Added missing toast error keys for tag/upload field deletion

### Known issue

- `pnpm check` triggers TanStack Router route generator which overwrites `_profile-settings.tsx` with a stub. Must format this file directly with `npx prettier --write` + `npx eslint --fix` instead.

**i18n-0015: Migrate constants and remove TOAST_MESSAGES**

Cleaned up legacy constant files:

- Deleted `src/lib/constants/messages.ts` — `TOAST_MESSAGES` + `DEFAULT_ERROR_MESSAGE` no longer imported
- Removed `BREADCRUMB_LABELS` from `src/lib/constants/navigation.ts` — all route pages use `t()` directly
- Removed re-export from `src/lib/constants/index.ts`

## i18n Feature Complete

All 16 tasks (i18n-0001 through i18n-0016) are now complete. The entire application is internationalized with Spanish (default) and English translations.

---

## Previously Completed

**Phase 5: Email Notifications (TASK-5.1 to 5.13)**

Implemented email notifications for payment order lifecycle using `@convex-dev/resend` component with React Email templates.

### Backend Changes

- **`convex/convex.config.ts`** (new): Registers `@convex-dev/resend` component
- **`convex/http.ts`** (new): Webhook endpoint for Resend delivery events
- **`convex/emails.ts`** (new): Main email sending action with handler map
- **`convex/emailsInternal.ts`** (new): Internal queries/mutations for email data
- **`convex/schema/notifications.ts`** (new): Notification types and status-to-notification mapping

- **`convex/paymentOrders.ts`**: Added notification triggers in `create` and `updateStatus`
- **`convex/paymentOrderDocuments.ts`**: Added `DOCUMENT_ADDED` notification trigger

### React Email Templates

All templates in `convex/emails/`:

- `base.tsx` - Shared layout with header, footer, Tailwind
- `orderCreated.tsx` - New payment order notification
- `orderApproved.tsx` - Approval notification (green accent)
- `orderRejected.tsx` - Rejection notification
- `orderNeedsSupport.tsx` - Request for documents (yellow accent)
- `orderCancelled.tsx` - Cancellation notification
- `documentAdded.tsx` - Document upload notification
- `devAlert.tsx` - Dev alert for missing notification configs

### Organization Invites Refactor

- **`convex/organizationInvites.ts`**: Refactored to use shared `resend` instance
- **`convex/organizationInvitesInternal.ts`** (new): Split queries/mutations from Node.js actions
- **`convex/emails/organizationInvite.tsx`** (new): Invite email template
- **`convex/emails/organizationWelcome.tsx`** (new): Welcome email template

### Code Patterns

- **`.claude/rules/patterns.md`** (new): Object maps over switches, guard clauses first

### Setup Required

1. Set `RESEND_WEBHOOK_SECRET` in Convex dashboard
2. Configure webhook URL in Resend: `https://<deployment>.convex.site/resend-webhook`

---

## Previously Completed

**TASK-3.8: Profile Creation Flow**

Allow org admins/owners to create payment order profiles from the UI.

### Backend Changes

- **`convex/paymentOrderProfiles.ts`**:
  - Added `create` mutation with authorization (org admin/owner only)
  - Generates slug from name using `generateSlug()`
  - Ensures slug uniqueness within org using `makeSlugUnique()`
  - Creates profile with empty `allowedEmails` array

### Frontend Changes

- **`src/components/profile-settings/create-profile-dialog.tsx`** (new):
  - FormDialog with name field
  - Navigates to new profile page on success

- **`src/routes/_authenticated/orgs/$slug/index.tsx`**:
  - Added "New Profile" button in card header (admins/owners only)
  - Integrated CreateProfileDialog component

- **`src/lib/constants/messages.ts`**:
  - Added `profile.created` toast messages

---

## Previously Completed

**TASK-4.27: Payment Orders Search & Filtering**

Search and filter payment orders by title, status, tag, date range, and creator.

### Backend Changes

- **`convex/schema/orders.ts`**:
  - Updated search index to `search_orders` with `filterFields: ['profileId']`

- **`convex/paymentOrders.ts`**:
  - Updated `getByProfile` query with filter args: `search`, `status`, `tagId`, `dateFrom`, `dateTo`, `creatorId`
  - Added `getCreators` query for creator filter dropdown (only returns data for admins/owners)

### Frontend Changes

- **`src/components/payment-orders/order-filters.tsx`** (new):
  - Search input (debounced 300ms)
  - Status dropdown
  - Tag dropdown with color dots
  - Date range pickers (from/to)
  - Creator dropdown (only visible to admins/owners)
  - Clear filters button

- **`src/hooks/use-debounce.ts`** (new):
  - Simple debounce hook for search input

- **`src/routes/.../profiles/$profileSlug/index.tsx`**:
  - Added filter state and integrated OrderFilters component
  - Passes filter values to getByProfile query

---

## Previously Completed

**TASK-4.documents: Payment Order Documents with Required Fields**

All documents must be linked to a tag's fileRequirement. No generic uploads. Block submission until required fields uploaded.

### Backend Changes

- **`convex/paymentOrderDocuments.ts`**:
  - Updated `create` mutation: requires `requirementLabel`, validates against tag's `fileRequirements`, validates MIME type and file size
  - Added `checkRequiredUploads` query: returns `{ complete: boolean, missing: string[] }`
  - GDPR-compliant `remove` action using UTApi to delete from UploadThing storage

- **`convex/paymentOrders.ts`**:
  - Updated `updateStatus` mutation: validates required uploads on CREATED → IN_REVIEW transition only
  - NEEDS_SUPPORT → IN_REVIEW does not require document validation (optional resubmission)

- **`convex/schema/documents.ts`**:
  - Added `requirementLabel` field (required, matches `tag.fileRequirements[].label`)

### Frontend Changes

- **`src/components/payment-orders/create-order-dialog.tsx`**:
  - Added `orgSlug` and `profileSlug` props
  - Navigates to order detail page after successful creation (to upload documents)

- **`src/components/payment-orders/requirement-upload-field.tsx`** (new):
  - Shows label + description + required/optional badge
  - If document exists: shows file info with delete option
  - Else: shows FileUploader with allowed types hint
  - Green checkmark when document is uploaded

- **`src/components/payment-orders/file-uploader.tsx`**:
  - Added required `requirementLabel` prop
  - Now uploads single file per requirement

- **`src/components/payment-orders/order-actions.tsx`**:
  - Added `canSubmit` prop
  - Disables "Submit for Review" button when required documents are missing

- **`src/routes/.../orders/$orderId.tsx`**:
  - Fetches tag with `fileRequirements`
  - Fetches `checkRequiredUploads` to determine if submission is allowed
  - Shows `RequirementUploadField` for each requirement instead of generic upload

---

## Previously Completed

**TASK-4.18: Payment Order Detail Page**: Full detail view with actions and timeline

### Changes

- Created `/orgs/$slug/profiles/$profileSlug/orders/$orderId` route
- Created `OrderInfoCard` component (amount, reason, dates, creator)
- Created `OrderTimeline` component for activity history
- Created `OrderActions` component with status-based action buttons
- Made `OrderCard` clickable to navigate to detail page
- Color-coded status badges (blue=review, green=approved, red=rejected, etc.)
- Updated `STATUS_CONFIG` with bgColor/textColor for each status

**Note**: TASK-4.19 (Timeline) and TASK-4.21 (Actions) were implemented inline.

---

## Previously Completed

**TASK-4.8: paymentOrderHistory.getByPaymentOrder Query**: Fetch history with user details for timeline

---

## Previously Completed

**TASK-4.5: paymentOrders.updateStatus Mutation**: Status change with validation and history tracking

---

## Previously Completed

**Profile Slug Regeneration on Name Change**: Updated `paymentOrderProfiles.update` mutation

---

## Previously Completed

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

| Task                 | Description                                                   | Status    |
| -------------------- | ------------------------------------------------------------- | --------- |
| **TASK-4.5**         | `paymentOrders.updateStatus` mutation with state transitions  | ✅ Done   |
| **TASK-4.7**         | `paymentOrderHistory.create` mutation                         | ⏭️ Inline |
| **TASK-4.8**         | `paymentOrderHistory.getByPaymentOrder` query                 | ✅ Done   |
| **TASK-4.18**        | `/orgs/$slug/profiles/$profileSlug/orders/$orderId` page      | ✅ Done   |
| **TASK-4.19**        | `PaymentOrderTimeline` component                              | ✅ Inline |
| **TASK-4.21**        | `PaymentOrderActions` component (approve/reject/request docs) | ✅ Inline |
| **TASK-4.documents** | Document uploads linked to tag's fileRequirements             | ✅ Done   |

**Note**: TASK-4.7 was implemented inline within `create` and `updateStatus` mutations.

### Priority 2: Documents & Files (Phase 4) - COMPLETED

| Task          | Description                                     | Status  |
| ------------- | ----------------------------------------------- | ------- |
| **TASK-4.9**  | `paymentOrderDocuments.create` mutation         | ✅ Done |
| **TASK-4.10** | `paymentOrderDocuments.getByPaymentOrder` query | ✅ Done |
| **TASK-4.11** | `paymentOrderDocuments.delete` action (GDPR)    | ✅ Done |
| **TASK-4.14** | `FileUploader` component                        | ✅ Done |
| **TASK-4.20** | `RequirementUploadField` component              | ✅ Done |

### Priority 3: Action Modals (Phase 4) - COMPLETED INLINE

Action modals implemented inline within `OrderActions` component:

| Task          | Description                                          | Status    |
| ------------- | ---------------------------------------------------- | --------- |
| **TASK-4.22** | `RequestSupportModal` - request additional documents | ✅ Inline |
| **TASK-4.23** | `RejectPaymentOrderModal` - reject with reason       | ✅ Inline |
| **TASK-4.24** | `ApprovePaymentOrderModal` - approve order           | ✅ Inline |

### Priority 4: Search & Filtering (Phase 4 + 6) - COMPLETED

| Task          | Description                                  | Status  |
| ------------- | -------------------------------------------- | ------- |
| **TASK-4.27** | `paymentOrders.search` with full-text search | ✅ Done |
| **TASK-6.8**  | Full-text search index on title              | ✅ Done |
| **TASK-6.9**  | `OrderFilters` component                     | ✅ Done |

### Backlog

**Phase 3 gaps:**

- ~~TASK-3.8: `paymentOrderProfiles.create` mutation (profile creation from UI)~~ ✅ Done
- ~~TASK-3.14: `/orgs/$slug/profiles/new` page~~ (implemented as dialog instead)

**Phase 5 (Email):**

- ~~TASK-5.1 to 5.13~~ ✅ Done (core email notifications)
- TASK-5.14: Notification preferences page - not started (optional)
- TASK-5.15: Notification preferences table - not started (optional)

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
| Phase 3 | Orgs & Profiles     | ~80% complete |
| Phase 4 | Payment Orders      | ~75% complete |
| Phase 5 | Email Notifications | ~85% complete |
| Phase 6 | Tags & Reports      | ~40% complete |
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
