---
paths:
  - 'src/components/**/*.tsx'
  - 'src/routes/**/*.tsx'
---

# Component Development

- Use function components with TypeScript interfaces for props
- Extract reusable logic into custom hooks in `src/hooks/`
- Use `cn()` from `@/lib/utils` for conditional class merging
- Prefer composition over prop drilling
- Keep components focused on a single responsibility

## Polymorphic Components (base-ui `render` prop)

**IMPORTANT:** shadcn/ui (base-nova) uses **base-ui**, not Radix. Never use `asChild` - it doesn't work. Always use the `render` prop instead.

### How it works

The `render` prop accepts JSX directly. Instead of passing children, pass them to `render`:

```tsx
// ✅ Correct - base-ui render prop with JSX
<DialogTrigger render={<Button>Open Dialog</Button>} />

// ❌ Wrong - Radix asChild (NOT SUPPORTED)
<DialogTrigger asChild>
  <Button>Open Dialog</Button>
</DialogTrigger>

// ❌ Wrong - children pattern
<DialogTrigger>
  <Button>Open Dialog</Button>
</DialogTrigger>
```

### Common patterns

**Button as Link:**

```tsx
<Button size="lg" render={<Link to="/path">Click me</Link>} />
```

**AlertDialogTrigger with Button:**

```tsx
<AlertDialogTrigger render={<Button variant="destructive">Delete</Button>} />
```

**DialogTrigger with Button:**

```tsx
<DialogTrigger render={<Button>+ New Item</Button>} />
```

### Why `render` instead of `asChild`

- `asChild` clones children and merges props (Radix pattern)
- `render` receives JSX directly (base-ui pattern)
- base-ui components don't support `asChild` at all
