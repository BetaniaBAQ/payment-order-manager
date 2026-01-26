# Plan: Organization UI Pages

## Summary

Build organization management UI pages under `_authenticated/orgs/`:

- `/orgs/new` - Create organization form
- `/orgs/[slug]` - Organization dashboard
- `/orgs/[slug]/settings` - Settings with member management

---

## Pages to Create

### 1. `/orgs/new` - Create Organization

**File:** `src/routes/_authenticated/orgs/new.tsx`

```
┌─────────────────────────────────┐
│  Create Organization            │
├─────────────────────────────────┤
│  Organization Name              │
│  [________________________]     │
│                                 │
│  [Cancel]  [Create Organization]│
└─────────────────────────────────┘
```

- TanStack Form with `requiredString` validation
- Calls `api.organizations.create`
- Redirects to `/orgs/[slug]` on success
- Toast notification on success/error

### 2. `/orgs/[slug]` - Organization Dashboard

**File:** `src/routes/_authenticated/orgs/$slug.tsx`

```
┌─────────────────────────────────────────┐
│  [Org Name]                  [Settings] │
├─────────────────────────────────────────┤
│  Payment Order Profiles                 │
│  ┌───────────────────────────────────┐  │
│  │ Profile 1          [5 orders] →  │  │
│  │ Profile 2          [12 orders] → │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [+ Create Profile]                     │
└─────────────────────────────────────────┘
```

- Loader fetches org by slug + validates membership
- Lists payment order profiles in org
- Links to settings, profile creation

### 3. `/orgs/[slug]/settings` - Organization Settings

**File:** `src/routes/_authenticated/orgs/$slug/settings.tsx`

Uses Tabs: General | Members

**General Tab:**

- Edit organization name
- Delete organization (owner only, with confirmation dialog)

**Members Tab:**

```
┌─────────────────────────────────────────┐
│  Members                   [+ Invite]   │
├─────────────────────────────────────────┤
│  Avatar | Name | Email | Role | Actions │
│  ───────────────────────────────────────│
│  [img]  | John | j@... | Owner|         │
│  [img]  | Jane | ja@.. | Admin| [Remove]│
│  [img]  | Bob  | b@... | Member|[Remove]│
├─────────────────────────────────────────┤
│  Pending Invites                        │
│  ───────────────────────────────────────│
│  admin@test.com | Admin | [Revoke]      │
└─────────────────────────────────────────┘
```

- Invite dialog: email + role selector
- Role change dropdown (owner only)
- Remove member button (admin+)
- Revoke invite button

---

## Route Structure

```
src/routes/_authenticated/orgs/
├── new.tsx              # /orgs/new
├── $slug.tsx            # /orgs/[slug]
└── $slug/
    └── settings.tsx     # /orgs/[slug]/settings
```

Note: TanStack Router uses `$param` for dynamic segments (not `[param]`)

---

## Convex API Usage

| Page                    | Queries                                                                                                      | Mutations/Actions                                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/orgs/new`             | -                                                                                                            | `organizations.create`                                                                                                                                                                    |
| `/orgs/[slug]`          | `organizations.getBySlug`, `paymentOrderProfiles.getByOrganization`, `organizationMemberships.getMemberRole` | -                                                                                                                                                                                         |
| `/orgs/[slug]/settings` | `organizationMemberships.getByOrganization`, `organizationInvites.getByOrganization`                         | `organizations.update`, `organizations.delete_`, `organizationMemberships.removeMember`, `organizationMemberships.updateRole`, `organizationInvites.create`, `organizationInvites.revoke` |

---

## Permission Checks

| Action         | Required Role                       |
| -------------- | ----------------------------------- |
| View org       | member+                             |
| Edit org name  | admin+                              |
| Delete org     | owner                               |
| Invite members | admin+                              |
| Remove members | admin+ (cannot remove owner/admins) |
| Change roles   | owner                               |
| Revoke invites | admin+                              |

---

## Files to Create

| File                                                | Purpose            |
| --------------------------------------------------- | ------------------ |
| `src/routes/_authenticated/orgs/new.tsx`            | Create org form    |
| `src/routes/_authenticated/orgs/$slug.tsx`          | Org dashboard      |
| `src/routes/_authenticated/orgs/$slug/settings.tsx` | Settings + members |

---

## Implementation Order

1. Create `/orgs/new` - simplest, standalone form
2. Create `/orgs/[slug]` - org dashboard with profile list
3. Create `/orgs/[slug]/settings` - settings with member management

---

## Verification

1. Navigate to `/orgs/new`, create org → redirects to `/orgs/my-org`
2. Org dashboard shows profiles (empty initially)
3. Settings → General tab: edit name works
4. Settings → Members tab: invite by email, see pending invite
5. Accept invite (different user), appears in members list
6. Change role, remove member works
7. Only owner sees delete org button
