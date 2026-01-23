import { tanstackConfig } from '@tanstack/eslint-config'
import pluginQuery from '@tanstack/eslint-plugin-query'
import pluginRouter from '@tanstack/eslint-plugin-router'

import convexPlugin from '@convex-dev/eslint-plugin'

import reactHooks from 'eslint-plugin-react-hooks'

export default [
  { ignores: ['convex/_generated/**', '.output/**'] },
  ...tanstackConfig,
  ...convexPlugin.configs.recommended,
  ...pluginQuery.configs['flat/recommended'],
  ...pluginRouter.configs['flat/recommended'],
  {
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
]
