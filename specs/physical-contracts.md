# Physical Client Support (Admin Tier Assignment)

## Context

Some clients handle contracts/payments physically (offline). Super admin needs to manually assign tiers to their orgs without Wompi/Stripe. New `paymentProvider: 'physical_contract'` value added to schema — need admin backend + UI to use it, plus billing-settings fixes for this provider case.

## Prerequisites

- Billing tasks 0001-0032 complete (subscriptions schema, limits, webhooks, UI)

## No-gos

- No contract metadata tracking — just tier assignment
- No billing emails/reminders for `paymentProvider: 'physical_contract'` subs (already excluded — crons filter by `'wompi'`)
- Schema change: added `paymentProvider: 'physical_contract'` to union (already applied in `convex/schema/subscriptions.ts`). `'none'` kept for free tier.
- No user-facing role system — super admin is env-var hardcoded emails only

## Tasks

### Task 1: Super admin helpers — `convex/lib/admin.ts` (new)

- Read `SUPER_ADMIN_EMAILS` from Convex env var, comma-split
- `isSuperAdmin(email: string): boolean`
- `assertSuperAdmin(ctx, authKitId)` — lookup user by authKitId, throw if not in list

### Task 2: Admin queries + mutation — `convex/admin.ts` (new)

Depends on: Task 1

- `checkIsSuperAdmin` query — args `{ authKitId }`, returns `boolean`
- `listOrganizationsWithSubscriptions` query — guarded, returns all orgs joined w/ subscription tier+status (default `'free'` if no sub)
- `assignTier` mutation — args `{ organizationId, tier }`, guarded, upserts subscription:
  - If sub exists: patch `tier`, `paymentProvider: 'physical_contract'`, `status: 'active'`
  - If no sub: insert with `paymentProvider: 'physical_contract'`, `status: 'active'`, `billingInterval: 'monthly'`, `currentPeriodEnd` far-future, zero usage counters
  - If tier is `'free'`: delete subscription row (revert to default free)

### Task 3: Admin page — `src/routes/_authenticated/admin/subscriptions.tsx` (new)

Depends on: Task 2

- Loader: `checkIsSuperAdmin` → redirect `/dashboard` if false
- Table columns: Org name, Slug, Current tier (badge), Status, Tier select
- Tier select: `free`/`pro`/`enterprise` dropdown → calls `assignTier` mutation
- Use existing shadcn `Table`, `Select`, `Badge`

### Task 4: Route constant — `src/lib/constants/navigation.ts` (modify)

- Add `adminSubscriptions: '/admin/subscriptions'` to `ROUTES`

### Task 5: Billing settings — handle `paymentProvider: 'physical_contract'` — `src/components/billing/billing-settings.tsx` (modify)

- Add `const isPhysical = subscription?.paymentProvider === 'physical_contract'`
- "Método de pago" card: add case for `isPhysical` → "Contrato físico (administrado manualmente)"
- Hide "Próximo cobro" when `isPhysical` (no renewal date applies)
- Hide "Mejorar plan" / upgrade button when `isPhysical` (admin controls their tier)

## Definition of Done

- [ ] `SUPER_ADMIN_EMAILS` env var read correctly in Convex backend
- [ ] Non-super-admin redirected from `/admin/subscriptions` to `/dashboard`
- [ ] Super admin sees all orgs with current tier in table
- [ ] Changing tier via dropdown creates/updates subscription with `paymentProvider: 'physical_contract'`
- [ ] Setting tier to `free` removes subscription row (org falls back to free defaults)
- [ ] Physical client's billing settings shows "Contrato físico" and hides upgrade/renewal UI
- [ ] Existing crons ignore `paymentProvider: 'physical_contract'` subs (already true, verify)
- [ ] `pnpm check` passes
