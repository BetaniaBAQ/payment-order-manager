# TASK-1.5: Configure dark mode theme with next-themes

## Summary
Wire up ThemeProvider and Toaster in root layout. CSS variables already configured.

## Changes

**File: `src/routes/__root.tsx`**
1. Import `ThemeProvider` from `next-themes`
2. Import `Toaster` from `@/components/ui/sonner`
3. Wrap `{children}` with `<ThemeProvider>`
4. Add `<Toaster />` before DevTools
5. Add `suppressHydrationWarning` to `<html>` tag (prevents flash)

**ThemeProvider config:**
```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="dark"
  enableSystem={false}
  disableTransitionOnChange={false}
>
```

## Verification
1. Run `pnpm dev`
2. Check page loads with dark theme by default
3. No hydration warnings in console
4. Theme persists after page reload (check localStorage for `theme` key)
