# Tailwind CSS v4 Conventions

## Child Selectors

Use the built-in `*:` variant for targeting direct children instead of arbitrary variants:

```tsx
// Correct - Tailwind v4 syntax
<div className="*:flex-1 *:min-w-0">

// Avoid - older arbitrary variant syntax
<div className="[&>*]:flex-1 [&>*]:min-w-0">
```

## General Principles

- Prefer built-in variants over arbitrary variants when available
- Use the simplest syntax that achieves the goal
- Avoid static widths (`w-[160px]`) on components that should adapt to their container
