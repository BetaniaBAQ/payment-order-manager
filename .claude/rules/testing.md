---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
---

# Testing

- Use Vitest and Testing Library
- Follow Arrange-Act-Assert pattern
- Test behavior, not implementation details
- Use `screen.getByRole()` over `getByTestId()` when possible
- Mock external dependencies, not internal modules
