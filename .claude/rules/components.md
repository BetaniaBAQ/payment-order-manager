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

## Button as Link (base-ui pattern)

shadcn/ui (base-nova) uses base-ui instead of Radix. For polymorphic components, use the `render` prop instead of `asChild`:

```tsx
// Correct - base-ui render prop
<Button
  size="lg"
  render={(props) => (
    <Link {...props} to="/path">
      Click me
    </Link>
  )}
/>

// Wrong - Radix asChild (not supported)
<Button asChild>
  <Link to="/path">Click me</Link>
</Button>
```
