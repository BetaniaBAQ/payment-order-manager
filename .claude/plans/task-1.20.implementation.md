# TASK-1.20: Configure root layout with providers

## Summary

All providers were already configured in previous tasks (TASK-1.7). This task verified the configuration is complete and working.

## Configuration

### QueryClient (src/router.tsx)

- Created with Convex integration via `ConvexQueryClient`
- Passed to router via context (TanStack Start pattern)
- SSR query integration enabled

### ConvexProvider (src/router.tsx)

- Configured in router's `Wrap` component
- Connected to `ConvexQueryClient` for reactive updates

### Other providers (src/routes/\_\_root.tsx)

- `ThemeProvider` - dark mode default
- `Toaster` - Sonner notifications
- `TanStackDevtools` - Router + Query devtools

## Files

- `src/router.tsx` - QueryClient + ConvexProvider
- `src/routes/__root.tsx` - ThemeProvider, Toaster, DevTools
