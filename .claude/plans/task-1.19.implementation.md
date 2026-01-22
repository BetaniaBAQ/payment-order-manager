# TASK-1.19: Create project folder structure

## Summary

Created complete folder structure per section 5.1 architecture. Added barrel exports for component folders and .gitkeep files for empty directories.

## Changes

### Component directories created

- `src/components/layout/` - Layout components (Header, Sidebar, Footer, AuthGuard)
- `src/components/payment-orders/` - Payment order components
- `src/components/tags/` - Tag components
- `src/components/files/` - File upload components
- `src/components/shared/` - Shared/reusable components

### Route directories created

- `src/routes/auth/` - Authentication routes
- `src/routes/dashboard/` - Dashboard routes
- `src/routes/dashboard/payment-orders/` - Payment order management
- `src/routes/dashboard/reports/` - Reports
- `src/routes/orgs/` - Organization routes
- `src/routes/orgs/$orgSlug/` - Organization detail
- `src/routes/orgs/$orgSlug/profiles/` - Profile management
- `src/routes/settings/` - Settings routes
- `src/routes/legal/` - Legal pages
- `src/routes/$orgSlug/` - Public organization view
- `src/routes/$orgSlug/$profileSlug/` - Public payment order submission

### Other changes

- Moved `src/styles.css` → `src/styles/globals.css`
- Updated import in `src/routes/__root.tsx`
- Created `tests/unit/` and `tests/e2e/` directories

## Files created/modified

- `src/components/layout/index.ts` - barrel export
- `src/components/payment-orders/index.ts` - barrel export
- `src/components/tags/index.ts` - barrel export
- `src/components/files/index.ts` - barrel export
- `src/components/shared/index.ts` - barrel export
- `src/styles/globals.css` - moved from src/styles.css
- `src/routes/__root.tsx` - updated import path
- `.gitkeep` files in all empty route and test directories
- README.md files in main folders (components/\*, hooks, stores, lib, tests)
