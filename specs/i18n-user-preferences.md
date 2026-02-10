# i18n + User Preferences

## Context

App has all UI strings hardcoded (mix of English and Spanish). No i18n system, no user settings for language/theme. `next-themes` installed but no user-facing toggle. Need full i18n with Spanish default + English, and header dropdown for language/theme switching with Convex DB persistence.

## Summary

Add `react-i18next` for internationalization (es default, en secondary). Extend Convex users table with `language`/`theme` fields. Create Zustand preferences store with localStorage persistence. Add header dropdown for language/theme switching. Translate all existing UI strings (~200+). Create locale-aware formatting utilities.

## Decisions

- Billing components: translate to both languages (full consistency)
- `TIER_LABELS`/`TIER_FEATURES`: move display strings from `convex/lib/tierLimits.ts` to translation files, keep only limits/thresholds server-side
- Zod validation errors: translate via `z.setErrorMap()` in this task

## Dependencies

```bash
pnpm add i18next react-i18next i18next-browser-languagedetector
```

## Changes

### 1. i18n Core Setup

**New: `src/i18n/index.ts`** - i18next init with bundled resources, `fallbackLng: 'es'`, namespaces: `common`, `orders`, `settings`, `billing`, `errors`

**New: `src/i18n/locales/{es,en}/{common,orders,settings,billing,errors}.json`** - 10 translation files

- Static imports (no lazy loading, ~5-10KB gzipped for 2 languages)
- `i18next-browser-languagedetector` for initial detection from localStorage
- Export `SUPPORTED_LANGUAGES`, `LANGUAGE_CONFIG` (label + flag per language)

### 2. Convex Schema + Mutations

**Edit: `convex/schema/users.ts`** - Add `language: v.optional(v.string())`, `theme: v.optional(v.string())`

**Edit: `convex/users.ts`** - Add `language`/`theme` to `update` mutation args + handler

### 3. Preferences Store

**New: `src/stores/preferencesStore.ts`** - Zustand store following existing pattern (devtools + persist)

- State: `language: 'es' | 'en'`, `theme: 'light' | 'dark'`
- Actions: `setLanguage`, `setTheme`
- Exports: `useLanguage()`, `useTheme()`, `usePreferencesActions()`

### 4. Sync Hook

**New: `src/hooks/use-sync-preferences.ts`**

- On mount: load DB prefs into Zustand store
- Sync language changes to `i18n.changeLanguage()` + `document.documentElement.lang`
- Sync theme changes to `next-themes` `setTheme()`

**Edit: `src/routes/_authenticated.tsx`** - Wire `useSyncPreferences` in layout

### 5. Header Dropdown

**New: `src/components/shared/preferences-dropdown.tsx`** - DropdownMenu with:

- Language section: list `SUPPORTED_LANGUAGES` with check mark on active
- Theme section: light/dark options with sun/moon icons
- On change: update Zustand (instant) + call `api.users.update` (async DB persist)

**Edit: `src/components/shared/app-header.tsx`** - Add `PreferencesDropdown` between email and sign-out

### 6. Root Layout

**Edit: `src/routes/__root.tsx`**

- `import '@/i18n'` at top
- Change `<html lang="en">` to `<html lang="es">`
- `suppressHydrationWarning` already present (handles client-side lang update)

### 7. Formatting Utilities

**New: `src/lib/format.ts`**

- `useLocale()` hook: maps `language` to `'es-CO'`/`'en-US'`
- `formatCurrency(amount, currency, locale)`
- `formatDate(timestamp, locale, options?)`
- `formatDateTime(timestamp, locale)`

Replace hardcoded `Intl.NumberFormat('en-US', ...)` and `Intl.DateTimeFormat(...)` calls across components.

### 8. Translate All UI Strings

**Constants migration strategy:** Store translation keys in constants, resolve at render time:

```ts
// STATUS_CONFIG: { labelKey: 'orders:status.created', ... }
// In component: t(config.labelKey)
```

**TOAST_MESSAGES refactor:** Remove constants file, callers pass `t('...')` results to `useMutationWithToast`:

```ts
const { t } = useTranslation()
useMutationWithToast(api.tags.delete_, {
  successMessage: t('settings:toast.profileDeleted'),
})
```

**Components to update (~43 files):**

| Category            | Files                                                                                                                                                                                  | Key changes                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Shared components   | `app-header`, `delete-confirm-dialog`, `error-boundary`, `empty-state`                                                                                                                 | Wrap strings with `t()`              |
| Order components    | `order-actions`, `order-card`, `order-info-card`, `order-list`, `order-timeline`, `order-filters`, `status-badge`, `create-order-dialog`, `documents-list`, `requirement-upload-field` | `t()` + locale-aware formatting      |
| Settings components | `general-settings`, `members-settings`, `member-row`, `invite-dialog`, `invite-row`                                                                                                    | `t()`                                |
| Billing components  | `billing-settings`, `pricing-cards`, `pricing-toggle`, `usage-meters`, `upgrade-modal`, `limit-banner`                                                                                 | `t()` (already Spanish, add English) |
| Constants           | `messages.ts`, `navigation.ts`, `payment-orders.ts`                                                                                                                                    | Keys instead of strings              |
| Routes              | `dashboard`, `orgs/new`, `orgs/$slug/index`, `settings`, `profiles/$profileSlug/index`, `orders/$orderId`, `admin/subscriptions`                                                       | `t()`                                |

### 9. date-fns Locale for Calendar

**Edit: date filter component** - Pass `es`/`enUS` locale to `react-day-picker` based on `useLanguage()`

### 10. Zod i18n Error Map

**New: `src/lib/validators/i18n-error-map.ts`** - Custom error map using `z.setErrorMap()` that reads from i18n translations for common validation errors (required, min, max, email, etc.)

**Edit: `src/i18n/locales/{es,en}/errors.json`** - Add validation error strings

**Edit: app entry** - Register error map on init

## Implementation Order

1. Foundation: deps + i18n init + preferences store + Convex schema
2. Header dropdown + sync hook + wire into layouts
3. Formatting utilities + zod i18n error map
4. Translation files (es + en) for all namespaces
5. Migrate constants to use translation keys
6. Update all components with `t()` calls (including billing)
7. Update all route pages
8. Remove `TOAST_MESSAGES` constant, inline `t()` at call sites
9. Move `TIER_LABELS`/`TIER_FEATURES` display strings to translations

## Key Files

- `src/routes/__root.tsx` - i18n import, html lang
- `convex/schema/users.ts` + `convex/users.ts` - Schema + mutation
- `src/stores/uiStore.ts` - Reference pattern for preferences store
- `src/components/shared/app-header.tsx` - Dropdown integration
- `src/components/payment-orders/order-actions.tsx` - Most complex translation (30+ strings)
- `src/hooks/use-mutation-with-toast.ts` - Toast message pattern change
- `src/lib/constants/messages.ts` - Will be removed/replaced

## Verification

1. Switch language in dropdown: all UI strings change immediately
2. Switch theme: light/dark toggles instantly
3. Refresh page: preferences persist (localStorage)
4. Log out + log in on different device: preferences loaded from Convex DB
5. New user: defaults to Spanish + dark theme
6. Currency/date formatting respects locale (es-CO vs en-US)
7. `pnpm check` passes
8. `pnpm build` succeeds (no SSR errors)
