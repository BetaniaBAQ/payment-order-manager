import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  { ignores: ['convex/_generated/**', '.output/**'] },
  ...tanstackConfig,
  {
    rules: {
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
    },
  },
]
