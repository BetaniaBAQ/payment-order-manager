# 0002: Admin queries + assignTier mutation

## Context

Backend for the admin subscriptions page. Three exports: a super-admin check query (used by the route loader), a list query (all orgs + their subscription), and a mutation to assign/change a tier.

## Dependencies

- 0001 (assertSuperAdmin, isSuperAdmin)

## File

`convex/admin.ts` (new)

## Requirements

### `checkIsSuperAdmin` query

- Args: `{ authKitId: v.string() }`
- Returns `boolean`
- Uses `isSuperAdmin` from `convex/lib/admin.ts` — looks up user email by authKitId

### `listOrganizationsWithSubscriptions` query

- Args: `{ authKitId: v.string() }`
- Guard: `assertSuperAdmin(ctx, args.authKitId)`
- Collects all `organizations` rows
- For each org, fetches subscription via `by_organization` index
- Returns array:

```typescript
{
  _id: Id<'organizations'>
  name: string
  slug: string
  tier: Tier // sub?.tier ?? 'free'
  status: string // sub?.status ?? 'none'
  paymentProvider: string // sub?.paymentProvider ?? 'none'
}
```

### `assignTier` mutation

- Args: `{ authKitId: v.string(), organizationId: v.id('organizations'), tier: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')) }`
- Guard: `assertSuperAdmin(ctx, args.authKitId)`
- Fetch existing subscription via `by_organization` index

**If tier is `'free'`:**

- If sub exists → delete it (`ctx.db.delete`)
- If no sub → no-op

**If tier is `'pro'` or `'enterprise'`:**

- If sub exists → patch: `tier`, `paymentProvider: 'physical_contract'`, `status: 'active'`, `updatedAt: Date.now()`
- If no sub → insert:

```typescript
{
  organizationId: args.organizationId,
  tier: args.tier,
  billingInterval: 'monthly',
  paymentProvider: 'physical_contract',
  status: 'active',
  currency: 'COP',
  amountPerPeriod: 0,
  currentPeriodStart: Date.now(),
  currentPeriodEnd: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
  ordersUsedThisMonth: 0,
  storageUsedBytes: 0,
  emailsSentThisMonth: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}
```

## No-gos

- Does NOT overwrite `providerCustomerId`/`providerSubscriptionId` if org had a Stripe/Wompi sub — patch only touches `tier`, `paymentProvider`, `status`, `updatedAt`
- No email notifications on tier change

## Definition of Done

- [ ] `checkIsSuperAdmin` returns `true` for configured emails, `false` otherwise
- [ ] `listOrganizationsWithSubscriptions` returns all orgs with tier info
- [ ] `assignTier` to `'pro'`/`'enterprise'` creates or updates subscription with `paymentProvider: 'physical_contract'`
- [ ] `assignTier` to `'free'` deletes subscription row (falls back to free defaults)
- [ ] All three exports guarded by super admin check
- [ ] No TypeScript errors
