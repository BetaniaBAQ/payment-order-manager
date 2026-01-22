---
paths:
  - 'src/stores/**/*.ts'
---

# Zustand State Management

Stores live in `src/stores/`. Use for client-side global state only.

Reference: [Working with Zustand](https://tkdodo.eu/blog/working-with-zustand)

## Store Pattern

Separate state from actions. Export custom hooks, not the raw store.

```ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// 1. Define state and actions separately
interface UIState {
  sidebarOpen: boolean
}

interface UIActions {
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
}

// 2. Create store (not exported directly)
const useUIStore = create<UIState & UIActions>()(
  devtools(
    persist(
      (set) => ({
        // State
        sidebarOpen: true,
        // Actions - model as events, not setters
        toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
        openSidebar: () => set({ sidebarOpen: true }),
        closeSidebar: () => set({ sidebarOpen: false }),
      }),
      { name: 'ui-store' },
    ),
    { name: 'UIStore' },
  ),
)

// 3. Export atomic selectors as custom hooks
export const useSidebarOpen = () => useUIStore((s) => s.sidebarOpen)

// 4. Export all actions via single hook (actions are static, no re-renders)
export const useUIActions = () =>
  useUIStore((s) => ({
    toggleSidebar: s.toggleSidebar,
    openSidebar: s.openSidebar,
    closeSidebar: s.closeSidebar,
  }))
```

## Usage in Components

```tsx
function Sidebar() {
  const sidebarOpen = useSidebarOpen()
  const { toggleSidebar } = useUIActions()

  return (
    <aside data-open={sidebarOpen}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  )
}
```

## Guidelines

1. **Export hooks, not stores** - Consumers don't write selectors
2. **Atomic selectors** - Return single values, not objects (strict equality)
3. **Actions as events** - `openSidebar()` not `setSidebarOpen(true)`
4. **Keep stores small** - One domain per store, combine via hooks
5. **Use `devtools`** - For Redux DevTools integration
6. **Use `persist` sparingly** - Only for state that survives refresh

## Anti-patterns

```tsx
// Bad - returns object, re-renders on any change
const { sidebarOpen } = useUIStore((s) => ({ sidebarOpen: s.sidebarOpen }))

// Bad - subscribes to entire store
const store = useUIStore()

// Bad - setter instead of event
const setSidebarOpen = (open: boolean) => set({ sidebarOpen: open })
```

## When to Use

- **Zustand**: UI state, filters, preferences, ephemeral client state
- **TanStack Query + Convex**: Server state, data fetching, cache
