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
