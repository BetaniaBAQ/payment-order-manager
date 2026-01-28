# TASK-3.8 + 3.14: Profile Creation Flow

## Summary

Allow org admins/owners to create payment order profiles from the UI.

## Changes

### 1. Backend: `convex/paymentOrderProfiles.ts`

Add `create` mutation:

- Args: `authKitId`, `organizationId`, `name`
- Validate user is org admin/owner
- Generate slug from name using `generateSlug()`
- Check slug uniqueness within org (append suffix if needed)
- Create profile with empty `allowedEmails`
- Return created profile

### 2. Toast Messages: `src/lib/constants/messages.ts`

Add to `TOAST_MESSAGES`:

```typescript
profile: {
  created: { success: 'Profile created!', error: 'Failed to create profile' },
}
```

### 3. UI Component: `src/components/profile-settings/create-profile-dialog.tsx`

New dialog component:

- Props: `organizationId`, `authKitId`, `orgSlug`, `open`, `onOpenChange`
- Form field: `name` (required)
- On success: navigate to new profile page
- Follow `CreateOrderDialog` pattern

### 4. Integration: `src/routes/_authenticated/orgs/$slug/index.tsx`

- Add `CreateProfileDialog` with trigger button in card header
- Only show for admins/owners
- Pass required props

## Files

| File                                                        | Action                       |
| ----------------------------------------------------------- | ---------------------------- |
| `convex/paymentOrderProfiles.ts`                            | Add `create` mutation        |
| `src/lib/constants/messages.ts`                             | Add profile.created messages |
| `src/components/profile-settings/create-profile-dialog.tsx` | New file                     |
| `src/routes/_authenticated/orgs/$slug/index.tsx`            | Integrate dialog             |

## Authorization

Only org admins and owners can create profiles (same as invite members).
