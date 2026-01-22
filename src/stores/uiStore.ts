import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// State
interface UIState {
  sidebarOpen: boolean
}

// Actions - model as events, not setters
interface UIActions {
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
}

// Store (not exported directly)
const useUIStore = create<UIState & UIActions>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
        openSidebar: () => set({ sidebarOpen: true }),
        closeSidebar: () => set({ sidebarOpen: false }),
      }),
      { name: 'ui-store' },
    ),
    { name: 'UIStore' },
  ),
)

// Atomic selectors as custom hooks
export const useSidebarOpen = () => useUIStore((s) => s.sidebarOpen)

// All actions via single hook (actions are static, no re-renders)
export const useUIActions = () =>
  useUIStore((s) => ({
    toggleSidebar: s.toggleSidebar,
    openSidebar: s.openSidebar,
    closeSidebar: s.closeSidebar,
  }))
