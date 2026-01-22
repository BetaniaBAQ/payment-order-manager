# TASK-1.10: Configure TanStack DevTools

## Summary

Configure unified TanStack DevTools panel with Router and Query debugging tools.

## Dependencies

```bash
pnpm add -D @tanstack/react-query-devtools @tanstack/router-devtools @tanstack/react-devtools
```

## Changes

### `src/routes/__root.tsx` (MODIFIED)

- Import `TanStackDevtools` from `@tanstack/react-devtools`
- Import `TanStackRouterDevtoolsPanel` and `ReactQueryDevtoolsPanel`
- Configure unified devtools with plugins array
- Position set to `bottom-right`

## Implementation

```tsx
<TanStackDevtools
  config={{ position: 'bottom-right' }}
  plugins={[
    { name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> },
    { name: 'TanStack Query', render: <ReactQueryDevtoolsPanel /> },
  ]}
/>
```

## Files Modified

| File                    | Change                                             |
| ----------------------- | -------------------------------------------------- |
| `src/routes/__root.tsx` | Add TanStack DevTools with Router and Query panels |

## Verification

1. `pnpm dev` shows devtools panel in bottom-right
2. Router tab shows route information
3. Query tab shows cache state
4. DevTools not present in production build
