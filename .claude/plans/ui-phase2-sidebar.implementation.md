# Phase 2 — Sidebar Navigation

## Summary

Replace header-based nav with sidebar nav for authenticated pages. Sidebar shows org switcher, profile list, settings link, and user menu. Mobile: Sheet overlay. Public pages unchanged.

## Questions (for user)

None — plan follows approved Phase 2 spec.

## New Components

### `src/components/shared/app-sidebar.tsx`

Main sidebar component using existing shadcn `Sidebar` primitives.

**SidebarHeader:**

- BetaniaLogo + "Betania" text (serif)
- Org switcher dropdown (ported from `OrgBreadcrumbChooser` logic)
  - Shows current org name + CaretDown
  - Dropdown: "Create org" + org list with checkmarks
  - Updates `lastSelectedOrgId` on select

**SidebarContent:**

- `SidebarGroup` "Profiles" with profile list
  - Each profile: `SidebarMenuButton` linking to `/orgs/$slug/profiles/$profileSlug`
  - Active state via `isActive` prop (compare URL)
  - Order count as `SidebarMenuBadge`

**SidebarFooter:**

- Settings link → `/orgs/$slug/settings` (only if `isOwnerOrAdmin`)
- User menu dropdown (ported from `PreferencesDropdown`):
  - Email display
  - Language selector
  - Theme selector
  - Sign out

**Data:** Extract `$slug` from `pathname` via regex (`/orgs/([^/]+)/`). Use `useSuspenseQuery` for org memberships + profiles.

### `src/components/shared/page-header.tsx`

Lightweight in-page header replacing the AppHeader's title+description pattern.

```tsx
type PageHeaderProps = {
  title: string
  description?: string
  actions?: React.ReactNode
}
```

Renders: `<div>` with `<h1>` + optional `<p>` + optional actions slot. No breadcrumbs needed — sidebar provides nav context.

## Layout Change

### `src/routes/_authenticated.tsx`

Wrap `<Outlet />` with sidebar layout:

```tsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <header className="flex h-12 items-center gap-2 border-b px-4">
      <SidebarTrigger />
    </header>
    <main className="flex-1 px-4 py-6 sm:px-6">
      <Outlet />
    </main>
  </SidebarInset>
</SidebarProvider>
```

Data fetching: prefetch org memberships in the `_authenticated` loader so sidebar data is ready.

## Route Updates (7 files)

Each route: remove `<div flex min-h-screen>` + `<AppHeader>` + `<main container>` wrapper. Content becomes flat — just the page body.

| Route                                                    | Remove                           | Keep/Add                                     |
| -------------------------------------------------------- | -------------------------------- | -------------------------------------------- |
| `orgs/$slug/index.tsx`                                   | AppHeader, outer div+main        | PageHeader with title+description, rest flat |
| `orgs/$slug/settings.tsx`                                | AppHeader, outer div+main        | PageHeader, tabs flat                        |
| `orgs/$slug/profiles/$profileSlug/index.tsx`             | AppHeader, outer div+main        | PageHeader, card flat                        |
| `orgs/$slug/profiles/$profileSlug/orders/$orderId.tsx`   | AppHeader, outer div+main        | Content flat with space-y-6                  |
| `orgs/$slug/profiles/$profileSlug/_profile-settings.tsx` | AppHeader, outer div+main        | PageHeader, content flat                     |
| `orgs/new.tsx`                                           | AppHeader, outer div+main        | Center card directly                         |
| `dashboard.tsx`                                          | No visual change (redirect-only) | No change needed                             |

## i18n Keys

Add to `common.json` (en/es):

```json
{
  "sidebar": {
    "profiles": "Profiles" / "Perfiles",
    "settings": "Settings" / "Configuración",
    "newOrganization": "New Organization" / "Nueva Organización",
    "organizations": "Organizations" / "Organizaciones",
    "toggleSidebar": "Toggle sidebar" / "Alternar barra lateral"
  }
}
```

## Files Changed

| File                                                                               | Change                                                            |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `src/components/shared/app-sidebar.tsx`                                            | **NEW** — sidebar nav component                                   |
| `src/components/shared/page-header.tsx`                                            | **NEW** — lightweight page title                                  |
| `src/routes/_authenticated.tsx`                                                    | Wrap Outlet with SidebarProvider layout, prefetch org memberships |
| `src/routes/_authenticated/orgs/$slug/index.tsx`                                   | Remove AppHeader+wrapper, use PageHeader                          |
| `src/routes/_authenticated/orgs/$slug/settings.tsx`                                | Remove AppHeader+wrapper, use PageHeader                          |
| `src/routes/_authenticated/orgs/$slug/profiles/$profileSlug/index.tsx`             | Remove AppHeader+wrapper, use PageHeader                          |
| `src/routes/_authenticated/orgs/$slug/profiles/$profileSlug/orders/$orderId.tsx`   | Remove AppHeader+wrapper                                          |
| `src/routes/_authenticated/orgs/$slug/profiles/$profileSlug/_profile-settings.tsx` | Remove AppHeader+wrapper, use PageHeader                          |
| `src/routes/_authenticated/orgs/new.tsx`                                           | Remove AppHeader+wrapper                                          |
| `src/i18n/locales/en/common.json`                                                  | Add `sidebar.*` keys                                              |
| `src/i18n/locales/es/common.json`                                                  | Add `sidebar.*` keys                                              |

## Deleted Files

- `src/components/shared/app-header.tsx` — replaced by sidebar + page-header; 0 remaining consumers
- `src/components/shared/org-breadcrumb-chooser.tsx` — only consumer was app-header; logic ported into app-sidebar
- `src/components/shared/preferences-dropdown.tsx` — only consumer was app-header; logic ported into app-sidebar footer
- `src/components/shared/index.ts` — remove `AppHeader` re-export
- `src/lib/constants/navigation.ts` — remove `HOME_BREADCRUMB` export (no longer needed)

## Not Changed

- Public layout / landing page — unchanged
- `dashboard.tsx` — redirect-only, no visual component

## Verification

1. Sidebar visible on all authenticated routes (desktop: fixed, mobile: Sheet overlay)
2. Org switcher works — changing org navigates and updates lastSelectedOrgId
3. Profile list shows active state on current profile page
4. Settings link visible only for admins/owners
5. User menu (language, theme, sign out) works from sidebar footer
6. Mobile: hamburger trigger opens Sheet, adequate touch targets
7. `pnpm check` passes (use direct prettier/eslint for `_profile-settings.tsx`)
