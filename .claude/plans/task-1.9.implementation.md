# TASK-1.9: Configure Zustand for local state

## Summary

Set up Zustand for client-side global state management with devtools and persist middleware.

## Dependencies

```bash
pnpm add zustand
```

## Changes

### 1. `src/stores/uiStore.ts` (NEW)

- Create UIState interface with sidebarOpen state
- Add toggleSidebar and setSidebarOpen actions
- Configure devtools middleware for Redux DevTools
- Configure persist middleware for localStorage

### 2. `.claude/rules/zustand.md` (NEW)

- Document store patterns
- Selector usage for performance
- When to use Zustand vs TanStack Query

## Files Created

| File                       | Purpose                             |
| -------------------------- | ----------------------------------- |
| `src/stores/uiStore.ts`    | UI state store with sidebar control |
| `.claude/rules/zustand.md` | Coding conventions for stores       |

## Verification

1. `pnpm tsc --noEmit` passes
2. `pnpm check` passes
3. Store exports `useUIStore` hook
4. Devtools middleware shows in Redux DevTools
