# Code Patterns

## Prefer Object Maps Over Switch Statements

Use object maps instead of switch statements for type-based dispatch. This pattern is:

- Easier to extend (add new entry vs new case block)
- More declarative and scannable
- Enables better type inference
- Separates data from logic

### Bad - Switch Statement

```typescript
switch (status) {
  case 'APPROVED':
    return { color: 'green', label: 'Approved' }
  case 'REJECTED':
    return { color: 'red', label: 'Rejected' }
  case 'PENDING':
    return { color: 'yellow', label: 'Pending' }
  default:
    return { color: 'gray', label: 'Unknown' }
}
```

### Good - Object Map

```typescript
const STATUS_CONFIG: Record<Status, { color: string; label: string }> = {
  APPROVED: { color: 'green', label: 'Approved' },
  REJECTED: { color: 'red', label: 'Rejected' },
  PENDING: { color: 'yellow', label: 'Pending' },
}

const config = STATUS_CONFIG[status] ?? { color: 'gray', label: 'Unknown' }
```

### For Functions/Handlers

```typescript
// Define handler type
type Handler = (ctx: Context) => Promise<Result>

// Map types to handlers
const handlers: Record<ActionType, Handler> = {
  CREATE: async (ctx) => {
    /* ... */
  },
  UPDATE: async (ctx) => {
    /* ... */
  },
  DELETE: async (ctx) => {
    /* ... */
  },
}

// Use
const handler = handlers[actionType]
if (!handler) throw new Error(`Unknown action: ${actionType}`)
const result = await handler(context)
```

### When Switch is Acceptable

- Fall-through logic needed
- Complex conditional logic within cases
- Only 2-3 simple cases

## Guard Clauses First

Handle edge cases and errors at the top with early returns/continues. Keep the happy path unindented at the bottom.

### Bad - Nested Happy Path

```typescript
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      // Happy path buried in nesting
      await doWork(user)
    } else {
      throw new Error('No permission')
    }
  } else {
    throw new Error('User inactive')
  }
} else {
  throw new Error('No user')
}
```

### Good - Guard Clauses

```typescript
// Guards at top - handle edge cases first
if (!user) throw new Error('No user')
if (!user.isActive) throw new Error('User inactive')
if (!user.hasPermission) throw new Error('No permission')

// Happy path - unindented, clear
await doWork(user)
```

### When Guard Needs to Return

If the next statement after the guard + happy path is a return, duplicate the return inside the guard to avoid `else`:

```typescript
// Guard: handle edge case and return early
if (!(key in CONFIG_MAP)) {
  console.warn('Missing config for:', key)
  await notifyDev({ issue: `Missing config: ${key}` })
  return getResult() // Duplicate return to exit guard
}

// Happy path: flat, no indentation
const config = CONFIG_MAP[key as keyof typeof CONFIG_MAP]
await processWithConfig(config)

return getResult()
```

This keeps the happy path unindented and avoids cognitive load from `else` blocks.

### Benefits

- Reduces nesting and cognitive load
- Edge cases are visible and documented at top
- Happy path reads linearly without indentation
- Easier to add new guards without restructuring
