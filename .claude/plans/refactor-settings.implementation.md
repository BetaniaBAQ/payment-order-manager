# Refactor Organization Settings

## Summary

Extract components from `settings.tsx` (582 lines) into `src/components/organization-settings/` folder.

## Questions (for user)

None - approach is clear.

## Changes

### New files

1. `src/components/organization-settings/types.ts` - Shared types (Member, Invite)
2. `src/components/organization-settings/general-settings.tsx` - Org details + delete
3. `src/components/organization-settings/members-settings.tsx` - Members table + management
4. `src/components/organization-settings/member-row.tsx` - Single member row (extracted from members-settings)
5. `src/components/organization-settings/invite-row.tsx` - Single invite row
6. `src/components/organization-settings/invite-dialog.tsx` - Invite modal
7. `src/components/organization-settings/index.ts` - Barrel exports

### Modified files

1. `src/routes/_authenticated/orgs/$slug/settings.tsx` - Import from new location, keep route definition + main component

## Files

| File                   | Action | Lines                |
| ---------------------- | ------ | -------------------- |
| `types.ts`             | Create | ~25                  |
| `general-settings.tsx` | Create | ~110                 |
| `members-settings.tsx` | Create | ~100                 |
| `member-row.tsx`       | Create | ~80                  |
| `invite-row.tsx`       | Create | ~25                  |
| `invite-dialog.tsx`    | Create | ~90                  |
| `index.ts`             | Create | ~10                  |
| `settings.tsx`         | Modify | ~130 (down from 582) |
