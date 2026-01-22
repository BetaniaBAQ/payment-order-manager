# TASK-1.7: Configure TanStack Query with Convex

## Summary

Set up Convex reactive database with TanStack Query integration in TanStack Start app.

## Dependencies

```bash
pnpm add convex @convex-dev/react-query @tanstack/react-query @tanstack/react-router-ssr-query
pnpm add -D @tanstack/react-query-devtools
```

## Changes

### 1. Initialize Convex

```bash
npx convex dev
```

- Creates `convex/` folder with `_generated/` types
- Creates `.env.local` with `VITE_CONVEX_URL`

### 2. `src/lib/convex.ts` (NEW)

```tsx
export { convexQuery, useConvexMutation } from '@convex-dev/react-query'
```

### 3. `src/router.tsx` (MODIFY)

- Import `QueryClient`, `MutationCache`, `notifyManager` from @tanstack/react-query
- Import `setupRouterSsrQueryIntegration` from @tanstack/react-router-ssr-query
- Import `ConvexQueryClient` from @convex-dev/react-query
- Import `ConvexProvider` from convex/react
- Create `ConvexQueryClient` with `VITE_CONVEX_URL`
- Create `QueryClient` with Convex's `hashFn()` and `queryFn()`
- Connect convex client: `convexQueryClient.connect(queryClient)`
- Add `context: { queryClient }` to router
- Wrap with `ConvexProvider` via router's `Wrap` option
- Call `setupRouterSsrQueryIntegration({ router, queryClient })`

### 4. `src/routes/__root.tsx` (MODIFY)

- Change `createRootRoute` to `createRootRouteWithContext<{ queryClient: QueryClient }>()`
- Import and add `ReactQueryDevtools` at `bottom-left` position

### 5. `tsconfig.json` (MODIFY)

- Add `"convex/**/*.ts"` to include array
- Add `"@convex/*": ["./convex/*"]` to paths

### 6. `.claude/rules/convex.md` (NEW)

```markdown
---
paths:
  - 'convex/**/*.ts'
---

# Convex

- Use `query` for reads (cached, reactive), `mutation` for writes, `action` for external APIs
- Always validate args with `v.` validators: `args: { id: v.id("users") }`
- Use `ctx.db.query("table").withIndex("by_field", q => q.eq("field", value))` for indexed lookups
- Prefer `ctx.db.get(id)` over query when you have the document ID
- Return document IDs from mutations for client-side cache updates
- Use `internal.` prefix for functions only called by other Convex functions
- Throw `ConvexError` for expected failures with structured error data
- Add `.index("by_field", ["field"])` to schema for frequently filtered fields
- Never manually invalidate queries - Convex reactivity handles updates automatically
```

## Verification

1. `npx convex dev` runs without errors
2. `pnpm dev` starts without TypeScript errors
3. ReactQueryDevtools panel opens at bottom-left
4. No hydration warnings in console
5. ConvexProvider visible in React DevTools

## Unresolved

None - all questions clarified.
