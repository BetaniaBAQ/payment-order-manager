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

interface UIStore extends UIState {
  actions: UIActions
}

const initialState: UIState = {
  sidebarOpen: true,
}

// 2. Create store (not exported directly)
const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        // Actions grouped under `actions` - stable object, no re-renders
        actions: {
          toggleSidebar: () =>
            set(
              (s) => ({ sidebarOpen: !s.sidebarOpen }),
              undefined,
              'actions/toggleSidebar',
            ),
          openSidebar: () =>
            set({ sidebarOpen: true }, undefined, 'actions/openSidebar'),
          closeSidebar: () =>
            set({ sidebarOpen: false }, undefined, 'actions/closeSidebar'),
        },
      }),
      { name: 'ui-store' },
    ),
    { name: 'UIStore' },
  ),
)

// 3. Export atomic selectors as custom hooks
export const useSidebarOpen = () => useUIStore((s) => s.sidebarOpen)

// 4. Export actions hook (actions object is stable, no useShallow needed)
export const useUIActions = () => useUIStore((s) => s.actions)
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
4. **Group actions under `actions` property** - Stable object prevents SSR issues, no `useShallow` needed
5. **Name actions for DevTools** - Use `set(state, undefined, 'actions/name')` for debugging
6. **Keep stores small** - One domain per store, combine via hooks
7. **Use `devtools`** - For Redux DevTools integration
8. **Use `persist` sparingly** - Only for state that survives refresh

## Anti-patterns

```tsx
// Bad - returns object, re-renders on any change
const { sidebarOpen } = useUIStore((s) => ({ sidebarOpen: s.sidebarOpen }))

// Bad - subscribes to entire store
const store = useUIStore()

// Bad - setter instead of event
const setSidebarOpen = (open: boolean) => set({ sidebarOpen: open })

// Bad - actions at root level (causes SSR infinite loop when selecting as object)
const useStore = create((set) => ({
  sidebarOpen: true,
  toggle: () => set(...), // Don't put actions at root!
}))
export const useActions = () => useStore((s) => ({ toggle: s.toggle })) // SSR crash!

// Bad - no action names (hard to debug in DevTools)
set({ sidebarOpen: true }) // Shows as anonymous action
```

## When to Use

- **Zustand**: UI state, filters, preferences, ephemeral client state
- **TanStack Query + Convex**: Server state, data fetching, cache
