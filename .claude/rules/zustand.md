---
paths:
  - 'src/stores/**/*.ts'
---

# Zustand State Management

Stores live in `src/stores/`. Use for client-side global state only.

## Store Pattern

```ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface MyState {
  value: string
  setValue: (value: string) => void
}

export const useMyStore = create<MyState>()(
  devtools(
    persist(
      (set) => ({
        value: '',
        setValue: (value) => set({ value }),
      }),
      { name: 'my-store' },
    ),
    { name: 'MyStore' },
  ),
)
```

## Guidelines

- Use `devtools` middleware for Redux DevTools integration
- Use `persist` middleware only for state that should survive refresh
- Keep stores small and focused (one domain per store)
- Name convention: `use{Domain}Store` (e.g., `useUIStore`, `useFilterStore`)
- Actions go inside the store, not as separate functions
- Use selectors to minimize re-renders:

```tsx
// Good - only re-renders when sidebarOpen changes
const sidebarOpen = useUIStore((state) => state.sidebarOpen)

// Bad - re-renders on any state change
const { sidebarOpen } = useUIStore()
```

## When to Use Zustand vs TanStack Query

- **Zustand**: UI state, filters, preferences, ephemeral client state
- **TanStack Query + Convex**: Server state, data fetching, cache
