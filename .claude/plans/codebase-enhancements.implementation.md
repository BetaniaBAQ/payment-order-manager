# Codebase Enhancements Plan

## Summary

Apply targeted improvements across code quality, performance, and accessibility based on codebase analysis.

## Findings by Category

### High Priority

#### 1. Code Quality - Reduce Duplication

| Item                     | Files                  | Description                                                          |
| ------------------------ | ---------------------- | -------------------------------------------------------------------- |
| `DeleteConfirmDialog`    | \_profile-settings.tsx | Extract repeated AlertDialog pattern for delete confirmations        |
| `canManageResource()`    | Multiple routes        | Extract authorization check `role === 'owner' \|\| role === 'admin'` |
| `ProfileVisibilityBadge` | index.tsx (2 files)    | Extract Public/Private badge rendering                               |

#### 2. Performance - Memoization

| Item               | File           | Description                                                              |
| ------------------ | -------------- | ------------------------------------------------------------------------ |
| Filter memoization | list.tsx:32-35 | Wrap `filteredItems` in `useMemo` to avoid recalculating on every render |

#### 3. Accessibility - Critical

| Item                 | File            | Description                                       |
| -------------------- | --------------- | ------------------------------------------------- |
| Search input a11y    | list.tsx:44-54  | Add `aria-label`, `aria-hidden` on icon           |
| Form validation a11y | Input component | Add `aria-invalid` and `aria-required` attributes |
| Dynamic page title   | \_\_root.tsx:33 | Update title based on current route               |

### Medium Priority

#### 4. Type Safety

| Item                 | Files                      | Description                                |
| -------------------- | -------------------------- | ------------------------------------------ |
| Remove `as never`    | orgs/$slug/index.tsx:55,62 | Replace type assertions with proper guards |
| Export complex types | \_profile-settings.tsx     | Centralize `Tag`, `Profile` type exports   |

#### 5. UX Improvements

| Item                 | File         | Description                              |
| -------------------- | ------------ | ---------------------------------------- |
| Loading skeletons    | Route files  | Add skeleton UI for data-fetching routes |
| Skip link            | \_\_root.tsx | Add skip-to-main-content link            |
| aria-live for search | list.tsx     | Announce filtered results count          |

### Low Priority

#### 6. Custom Hooks

| Item                     | Description                                  |
| ------------------------ | -------------------------------------------- |
| `useCreateEditDialog<T>` | Encapsulate create/edit dialog state pattern |
| `ListItemLink` component | Extract repeated Link styling pattern        |

## Implementation Plan (All Items)

### Phase 1: List Component Improvements

**File:** `src/components/shared/list.tsx`

1. Add `useMemo` for `filteredItems`
2. Add `aria-label` to search input
3. Add `aria-hidden="true"` to magnifying glass icon
4. Add `aria-live="polite"` region for search results count

### Phase 2: Reusable Components

**Create:** `src/components/shared/delete-confirm-dialog.tsx`

```tsx
interface DeleteConfirmDialogProps {
  title: string
  description: string
  onConfirm: () => void
  trigger?: ReactNode
}
```

**Create:** `src/components/shared/profile-visibility-badge.tsx`

```tsx
interface ProfileVisibilityBadgeProps {
  isPublic: boolean
}
```

**Create:** `src/lib/auth.ts`

```tsx
type MemberRole = 'owner' | 'admin' | 'member'
export function canManageResource(role: MemberRole | null): boolean
export function isOwnerOrAdmin(role: MemberRole | null): boolean
```

### Phase 3: Type Safety

**Files:** Multiple routes

1. Remove `as never` type assertions
2. Add proper null checks/early returns instead
3. Export complex types from centralized location

### Phase 4: Accessibility

**Files:** `src/components/ui/input.tsx`, `src/routes/__root.tsx`

1. Add `aria-invalid` support to Input component
2. Add `aria-required` support to Input component
3. Update dynamic page title based on route
4. Add skip-to-main-content link

### Phase 5: UX - Loading States

**Files:** Route files

1. Create loading skeleton components
2. Add Suspense boundaries with skeleton fallbacks

### Phase 6: Custom Hooks

**Create:** `src/hooks/use-create-edit-dialog.ts`

```tsx
function useCreateEditDialog<T>() {
  return { isOpen, editingItem, openCreate, openEdit, close }
}
```

### Phase 7: Apply Extractions

**Files to update:**

- `src/routes/_authenticated/orgs/$slug/index.tsx`
- `src/routes/_authenticated/orgs/$slug/profiles/$profileSlug/_profile-settings.tsx`
- `src/routes/_authenticated/orgs/$slug/profiles/$profileSlug/index.tsx`
- `src/routes/_authenticated/orgs/$slug/settings.tsx`

## Verification

1. `pnpm check` - No TypeScript/lint errors
2. Visual test with Playwriter:
   - Search filtering in lists
   - Delete confirmations
   - Loading states
3. Test keyboard navigation on search inputs
4. Verify authorization redirects still work
