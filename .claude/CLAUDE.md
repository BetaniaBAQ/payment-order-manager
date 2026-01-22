# Payment Order Manager

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
- Create all plans within @.claude/plans following the {task_id}.implementation.md file naming convention.

## What

Full-stack TypeScript application for managing payment orders.

**Stack:** React 19 + TanStack Start + Vite + Tailwind CSS v4 + shadcn/ui (base-nova)

**Structure:**

- `src/routes/` - File-based routing (TanStack Router)
- `src/components/ui/` - shadcn/ui primitives (do not edit directly)
- `src/components/` - Application components
- `src/lib/` - Utilities and helpers
- `specs/` - Feature specifications

## How

**Commands:**

- `pnpm dev` - Start dev server (port 3000)
- `pnpm build` - Production build
- `pnpm test` - Run tests (Vitest)
- `pnpm check` - Format + lint fix

**Adding UI components:**

```bash
pnpm dlx shadcn@latest add <component>
```

## Rules

- Use existing shadcn/ui components before creating custom ones
- Colocate tests with source files as `*.test.ts(x)`
- Prefer TanStack Router's type-safe navigation over manual URLs
- Use `@/` path alias for imports from `src/`
- Run `pnpm check` after completing tasks to format and lint files
- Before starting a task:
  - Create `.claude/plans/{task_id}.implementation.md` with summary, changes, and files
- After completing a task:
  - Update `specs/plan.md`: mark criteria `[x]`, add "Additional work completed" if needed
  - Write the implementation details for the next task in `.claude/plans/{next_task_id}.implementation.md` with summary, changes, and files
  - Update `specs/handoff.md` with completed task and next task to work on referencing its implementation details
  - Ask for review of the changes, and if changes are approved commit and push them
- Skip documentation for tasks already implemented in previous sessions

## Documentation

- @specs/ for feature specifications
- @docs/architecture.md for system design (when created)
