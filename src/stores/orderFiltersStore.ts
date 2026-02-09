import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Id } from 'convex/_generated/dataModel'
import type { PaymentOrderStatus } from 'convex/schema'


import type { FilterSearchParams } from '@/lib/validators/organization-profile'

// State
interface OrderFiltersState {
  search: string
  status: PaymentOrderStatus | undefined
  tagId: Id<'tags'> | undefined
  dateFrom: Date | undefined
  dateTo: Date | undefined
  creatorId: Id<'users'> | undefined
}

// Actions - model as events, not setters
interface OrderFiltersActions {
  setSearch: (search: string) => void
  setStatus: (status: PaymentOrderStatus | undefined) => void
  setTagId: (tagId: Id<'tags'> | undefined) => void
  setDateFrom: (dateFrom: Date | undefined) => void
  setDateTo: (dateTo: Date | undefined) => void
  setCreatorId: (creatorId: Id<'users'> | undefined) => void
  clearFilters: () => void
  hydrateFromUrl: (params: FilterSearchParams) => void
}

interface OrderFiltersStore extends OrderFiltersState {
  actions: OrderFiltersActions
}

const initialState: OrderFiltersState = {
  search: '',
  status: undefined,
  tagId: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  creatorId: undefined,
}

// Store (not exported directly)
const useOrderFiltersStore = create<OrderFiltersStore>()(
  devtools(
    (set) => ({
      ...initialState,
      actions: {
        setSearch: (search) => set({ search }, undefined, 'actions/setSearch'),
        setStatus: (status) => set({ status }, undefined, 'actions/setStatus'),
        setTagId: (tagId) => set({ tagId }, undefined, 'actions/setTagId'),
        setDateFrom: (dateFrom) =>
          set({ dateFrom }, undefined, 'actions/setDateFrom'),
        setDateTo: (dateTo) => set({ dateTo }, undefined, 'actions/setDateTo'),
        setCreatorId: (creatorId) =>
          set({ creatorId }, undefined, 'actions/setCreatorId'),
        clearFilters: () =>
          set(initialState, undefined, 'actions/clearFilters'),
        hydrateFromUrl: (params) =>
          set(
            {
              search: params.q ?? '',
              status: params.status as PaymentOrderStatus | undefined,
              tagId: params.tag as Id<'tags'> | undefined,
              dateFrom: params.from ? new Date(params.from) : undefined,
              dateTo: params.to ? new Date(params.to) : undefined,
              creatorId: params.creator as Id<'users'> | undefined,
            },
            undefined,
            'actions/hydrateFromUrl',
          ),
      },
    }),
    { name: 'OrderFiltersStore' },
  ),
)

// Atomic selectors as custom hooks
export const useOrderFilterSearch = () => useOrderFiltersStore((s) => s.search)
export const useOrderFilterStatus = () => useOrderFiltersStore((s) => s.status)
export const useOrderFilterTagId = () => useOrderFiltersStore((s) => s.tagId)
export const useOrderFilterDateFrom = () =>
  useOrderFiltersStore((s) => s.dateFrom)
export const useOrderFilterDateTo = () => useOrderFiltersStore((s) => s.dateTo)
export const useOrderFilterCreatorId = () =>
  useOrderFiltersStore((s) => s.creatorId)

// All actions via single hook (actions object is stable, no re-renders)
export const useOrderFiltersActions = () =>
  useOrderFiltersStore((s) => s.actions)

// Export for external sync (URL persistence)
export const subscribeToFilterStore = useOrderFiltersStore.subscribe
