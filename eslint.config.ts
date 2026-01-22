import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  { ignores: ['convex/_generated/**', '.output/**'] },
  ...tanstackConfig,
]
