/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  importOrder: [
    '^react(-dom)?$',
    '',
    '^@tanstack/(.*)$',
    '',
    '^@workos/(.*)$',
    '^@uploadthing/(.*)$',
    '^convex(.*)$',
    '^@convex-dev/(.*)$',
    '^@convex/(.*)$',
    '^@sentry/(.*)$',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/components/(.*)$',
    '^@/hooks/(.*)$',
    '^@/lib/(.*)$',
    '^@/stores/(.*)$',
    '',
    '^[./]',
  ],
}

export default config
