# TASK-4.27: Payment Orders Search & Filtering

## Summary

Add text search and filtering to payment orders list. Server-side search with Convex search index, client-side filter state.

## Requirements

1. Date range filtering - available for all users
2. Creator filter - only visible to org admin/owners and profile owners

## Approach

**Hybrid**: Server-side text search (Convex search index) + client-side filtering for status/tag (fast, reactive).

Why: Convex search index doesn't support combining search with filters in one query. Fetch all profile orders, then filter client-side. For large datasets, can add server-side pagination later.

## Schema Changes

### `convex/schema/orders.ts`

Update search index to include more fields:

```typescript
.searchIndex('search_orders', {
  searchField: 'title',
  filterFields: ['profileId', 'status', 'tagId'],
})
```

Note: Convex search only supports ONE searchField. We'll search title and filter client-side on description/reason.

## Backend Changes

### `convex/paymentOrders.ts`

Update `getByProfile` to accept optional filters:

```typescript
export const getByProfile = query({
  args: {
    profileId: v.id('paymentOrderProfiles'),
    authKitId: v.string(),
    search: v.optional(v.string()),
    status: v.optional(v.array(paymentOrderStatusValidator)),
    tagId: v.optional(v.id('tags')),
    dateFrom: v.optional(v.number()), // timestamp
    dateTo: v.optional(v.number()), // timestamp
    creatorId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    // ... existing access checks ...

    let orders
    if (args.search) {
      // Use search index
      orders = await ctx.db
        .query('paymentOrders')
        .withSearchIndex('search_orders', (q) =>
          q.search('title', args.search).eq('profileId', args.profileId),
        )
        .collect()
    } else {
      // Use regular index
      orders = await ctx.db
        .query('paymentOrders')
        .withIndex('by_profile', (q) => q.eq('profileId', args.profileId))
        .collect()
    }

    // Apply filters
    if (args.status?.length) {
      orders = orders.filter((o) => args.status.includes(o.status))
    }
    if (args.tagId) {
      orders = orders.filter((o) => o.tagId === args.tagId)
    }
    if (args.dateFrom) {
      orders = orders.filter((o) => o.createdAt >= args.dateFrom)
    }
    if (args.dateTo) {
      orders = orders.filter((o) => o.createdAt <= args.dateTo)
    }
    if (args.creatorId) {
      orders = orders.filter((o) => o.createdById === args.creatorId)
    }

    // ... rest of enrichment ...
  },
})
```

## Frontend Changes

### `src/components/payment-orders/order-filters.tsx` (new)

Filter bar with:

- Search input (debounced, 300ms)
- Status multi-select (chips or dropdown)
- Tag select (dropdown with color dots)
- Date range picker (from/to)
- Creator select (only shown to admins/owners)
- Clear filters button

```typescript
interface OrderFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: PaymentOrderStatus[]
  onStatusChange: (value: PaymentOrderStatus[]) => void
  tagId: string | undefined
  onTagChange: (value: string | undefined) => void
  tags: Array<{ _id: string; name: string; color: string }>
  dateFrom: Date | undefined
  onDateFromChange: (value: Date | undefined) => void
  dateTo: Date | undefined
  onDateToChange: (value: Date | undefined) => void
  creatorId: string | undefined
  onCreatorChange: (value: string | undefined) => void
  creators: Array<{ _id: string; name: string; email: string }> | undefined
  showCreatorFilter: boolean // true for admins/owners
  onClear: () => void
}
```

### `src/routes/.../profiles/$profileSlug/index.tsx`

Add filter state and pass to query:

```typescript
const [filters, setFilters] = useState({
  search: '',
  status: [] as PaymentOrderStatus[],
  tagId: undefined as string | undefined,
})

// Debounce search
const debouncedSearch = useDebounce(filters.search, 300)

const { data: orders } = useSuspenseQuery(
  convexQuery(api.paymentOrders.getByProfile, {
    profileId,
    authKitId,
    search: debouncedSearch || undefined,
    status: filters.status.length ? filters.status : undefined,
    tagId: filters.tagId,
  }),
)
```

### `src/hooks/use-debounce.ts` (new)

Simple debounce hook for search input.

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Payment Orders                               [New Order]    │
├─────────────────────────────────────────────────────────────┤
│ 🔍 Search orders...                                         │
│ [Status ▼] [Tag ▼] [From 📅] [To 📅] [Creator ▼*] [Clear]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│ │ Order 1 │ │ Order 2 │ │ Order 3 │                        │
│ └─────────┘ └─────────┘ └─────────┘                        │
└─────────────────────────────────────────────────────────────┘

* Creator filter only visible to org admin/owners and profile owners
```

## Files Modified

- `convex/schema/orders.ts` - Update search index with filterFields
- `convex/paymentOrders.ts` - Add filter args to getByProfile, add getCreators query
- `src/components/payment-orders/order-filters.tsx` - New filter bar
- `src/components/payment-orders/index.ts` - Export new component
- `src/routes/.../profiles/$profileSlug/index.tsx` - Add filter state
- `src/hooks/use-debounce.ts` - New debounce hook

## Verification

1. Search by title returns matching orders
2. Filter by status shows only matching statuses
3. Filter by tag shows only orders with that tag
4. Filter by date range works correctly
5. Creator filter only visible to admins/owners
6. Creator filter shows all users who created orders
7. Combining search + multiple filters works correctly
8. Clear button resets all filters
9. Empty state shows when no results match
10. Whitelisted users only see their filtered orders (no creator filter)
