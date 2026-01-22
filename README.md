# Payment Order Manager

Full-stack TypeScript application for managing payment orders at Betania.

## Tech Stack

- **Framework:** TanStack Start + React 19
- **Styling:** Tailwind CSS v4 + shadcn/ui (base-nova)
- **Database:** Convex (reactive)
- **State:** TanStack Query + Convex integration
- **Routing:** TanStack Router (file-based)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development (app + Convex)
pnpm dev

# Or run separately
pnpm dev:app      # Vite dev server on port 3000
pnpm dev:convex   # Convex backend
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run app and Convex simultaneously |
| `pnpm dev:app` | Run Vite dev server only |
| `pnpm dev:convex` | Run Convex dev only |
| `pnpm build` | Production build |
| `pnpm test` | Run tests (Vitest) |
| `pnpm check` | Format + lint fix |

## Project Structure

```
src/
├── components/ui/   # shadcn/ui primitives
├── components/      # App components
├── hooks/           # Custom hooks
├── lib/             # Utilities
├── routes/          # File-based routing
convex/              # Convex backend functions
specs/               # Feature specifications
```
