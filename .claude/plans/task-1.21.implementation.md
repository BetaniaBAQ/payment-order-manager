# TASK-1.21: Create basic landing page

## Summary

Created minimalist landing page with header, hero section, and footer. Added stub routes for navigation.

## Changes

### src/routes/index.tsx

- Header with "Betania" branding and "Sign in" button
- Hero section with title "Payment Order Management" and description
- "Get Started" CTA button linking to `/auth/login`
- Footer with copyright and links to Privacy/Terms
- Responsive layout using Tailwind CSS
- Uses base-ui Button `render` prop for polymorphic Link components

### Stub routes created

- `src/routes/auth/login.tsx` - Login page placeholder
- `src/routes/legal/privacy.tsx` - Privacy policy placeholder
- `src/routes/legal/terms.tsx` - Terms of service placeholder

## Pattern: Button as Link

base-ui uses `render` prop instead of Radix's `asChild`:

```tsx
<Button
  size="lg"
  render={(props) => (
    <Link {...props} to="/auth/login">
      Get Started
    </Link>
  )}
/>
```

## Design

- Full-height layout with flex column
- Centered hero content with max-width constraint
- Dark mode compatible using theme CSS variables
- Mobile-first responsive design
