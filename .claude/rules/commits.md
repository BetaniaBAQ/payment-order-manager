---
alwaysApply: true
---

# Conventional Commits

Follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

## Format

```
<type>[(scope)][!]: <description>

[body]

[footer(s)]
```

## Types

| Type       | Description                 |
| ---------- | --------------------------- |
| `feat`     | New feature (MINOR version) |
| `fix`      | Bug fix (PATCH version)     |
| `docs`     | Documentation only          |
| `style`    | Formatting, no code change  |
| `refactor` | Code change, no feature/fix |
| `perf`     | Performance improvement     |
| `test`     | Adding/fixing tests         |
| `chore`    | Build, tooling, deps        |
| `ci`       | CI configuration            |

## Scope

Optional. Use component/area name in parentheses:

```
feat(auth): add login endpoint
fix(ui): correct button alignment
```

## Breaking Changes

Use `!` before colon OR `BREAKING CHANGE:` footer:

```
feat(api)!: remove deprecated endpoints

BREAKING CHANGE: /v1/* endpoints removed
```

## Examples

```
feat(forms): add email validation
fix: resolve memory leak in cache
docs: update API documentation
refactor(db): simplify query builder
chore: update dependencies
```

## Rules

- Use imperative mood: "add" not "added" or "adds"
- No period at end of description
- Keep description under 72 characters
- Add task ID when applicable: `feat(auth): add login (TASK-1.2)`

## Change Review (MANDATORY)

**Before committing, ALWAYS ask for user review.** Present a summary of:

1. Files added/modified/deleted
2. Key changes in each file
3. Any Convex generated files (`convex/_generated/*`)

Only commit and push after explicit user approval.

### Files to Always Include in Review

- `convex/_generated/api.d.ts` - API type definitions
- `convex/_generated/dataModel.d.ts` - Data model types
- `package.json` / `pnpm-lock.yaml` - Dependency changes
- `.env.example` - Environment variable templates
